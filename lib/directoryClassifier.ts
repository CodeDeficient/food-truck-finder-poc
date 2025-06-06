// lib/directoryClassifier.ts
import { firecrawl } from './firecrawl';
import { gemini } from './gemini';
import { supabaseAdmin } from './supabase'; // To save to discovered_directories
import { DirectoryClassificationOutput } from './types';

// Max content length to pass to Gemini for classification to manage token usage
const MAX_CONTENT_LENGTH_FOR_CLASSIFICATION = 15000; // Characters

interface ClassificationResult extends DirectoryClassificationOutput {
  url: string;
  processed_at: string;
  error?: string;
}

/**
 * Takes a candidate URL, scrapes its content, and uses Gemini to classify it.
 * Saves the classification result (or error) to the 'discovered_directories' table.
 *
 * @param candidateUrl The URL to classify.
 * @returns Promise<void>
 */
export async function classifyAndStoreDirectory(candidateUrl: string): Promise<void> {
  console.info(`DirectoryClassifier: Starting classification for URL: ${candidateUrl}`);

  let firecrawlError: string | undefined;
  let pageContent: string | undefined;
  let classificationData: DirectoryClassificationOutput | undefined;
  let geminiError: string | undefined;
  let geminiPromptSent: string | undefined; // For debugging

  try {
    // 1. Scrape content using Firecrawl
    console.info(`DirectoryClassifier: Scraping content for ${candidateUrl} using Firecrawl.`);
    const scrapeResult = await firecrawl.scrapeUrl(candidateUrl, {
      pageOptions: { format: 'markdown' }, // Get markdown for cleaner text
      // Consider 'onlyMainContent: true' if directory listings are usually in main content.
      // However, some sites might have listings in sidebars or less prominent sections.
      // For now, let's try with full content and rely on Gemini's intelligence.
    });

    if (!scrapeResult.success || !scrapeResult.data?.markdown) {
      firecrawlError = scrapeResult.error || 'Firecrawl failed to return markdown content.';
      console.warn(`DirectoryClassifier: Firecrawl failed for ${candidateUrl}: ${firecrawlError}`);
    } else {
      pageContent = scrapeResult.data.markdown;
      console.info(`DirectoryClassifier: Successfully scraped content for ${candidateUrl}. Length: ${pageContent.length}`);

      // Truncate if necessary before sending to Gemini
      if (pageContent.length > MAX_CONTENT_LENGTH_FOR_CLASSIFICATION) {
        console.warn(`DirectoryClassifier: Content for ${candidateUrl} is too long (${pageContent.length} chars), truncating to ${MAX_CONTENT_LENGTH_FOR_CLASSIFICATION}.`);
        pageContent = pageContent.substring(0, MAX_CONTENT_LENGTH_FOR_CLASSIFICATION);
      }
    }
  } catch (fcError: any) {
    firecrawlError = fcError.message || 'Unknown error during Firecrawl scraping.';
    console.error(`DirectoryClassifier: Exception during Firecrawl scrape for ${candidateUrl}: ${firecrawlError}`);
  }

  // 2. Classify content using Gemini (only if content was retrieved)
  if (pageContent && !firecrawlError) {
    try {
      console.info(`DirectoryClassifier: Sending content of ${candidateUrl} to Gemini for classification.`);
      const geminiResult = await gemini.getDirectoryClassificationForContent(pageContent);
      geminiPromptSent = geminiResult.promptSent; // Capture for potential debugging

      if (geminiResult.success && geminiResult.data) {
        classificationData = geminiResult.data;
        console.info(`DirectoryClassifier: Gemini classification successful for ${candidateUrl}: `, classificationData);
      } else {
        geminiError = geminiResult.error || 'Gemini classification failed to return data.';
        console.warn(`DirectoryClassifier: Gemini classification failed for ${candidateUrl}: ${geminiError}`);
      }
    } catch (gmError: any) {
      geminiError = gmError.message || 'Unknown error during Gemini classification.';
      console.error(`DirectoryClassifier: Exception during Gemini classification for ${candidateUrl}: ${geminiError}`);
    }
  } else if (!pageContent && !firecrawlError) {
    // This case should ideally be caught by Firecrawl's own error reporting,
    // but as a fallback if markdown was empty but success was true.
    firecrawlError = 'Firecrawl returned no markdown content despite reporting success.';
    console.warn(`DirectoryClassifier: No content to classify for ${candidateUrl} (Firecrawl reported success but no markdown).`);
  }


  // 3. Store results in Supabase 'discovered_directories' table
  // We always try to store a record, even if there were errors, to mark it as processed.
  const status = firecrawlError ? 'error_scraping' : (geminiError ? 'error_classification' : (classificationData?.is_directory && classificationData?.is_sc_focused && classificationData.relevance_score > 0.5 ? 'active' : 'inactive'));
  const notes = firecrawlError ? `Firecrawl: ${firecrawlError}` : (geminiError ? `Gemini: ${geminiError}` : (classificationData ? `SC Focused: ${classificationData.is_sc_focused}, Relevance: ${classificationData.relevance_score}` : 'No classification data.'));

  // Check if URL already exists to decide on insert vs update.
  // Prospector should ideally not send duplicates, but this is a safeguard.
  // For this version, we'll assume prospector sends URLs that are not yet in `discovered_directories`
  // or that we are fine with an upsert or handling a unique constraint violation if needed.
  // A simpler approach for now: try to insert, and if it fails on unique `url`, then update.
  // However, the plan is that this classifier is called for *new* candidate URLs.
  // So, we primarily expect inserts. If a URL is re-classified, it would be an update.

  const dbRecord = {
    url: candidateUrl,
    name: classificationData?.directory_name,
    directory_description: classificationData?.directory_description,
    is_sc_focused: classificationData?.is_sc_focused,
    relevance_score: classificationData?.relevance_score,
    // sc_focus_score is part of DirectoryClassificationOutput, ensure it's saved
    // Let's add a field for it in the db table or map it to notes if not separate
    // For now, assuming sc_focus_score is not a separate DB column based on step 4 schema,
    // so it will be implicitly part of the notes or overall relevance.
    // If it needs to be stored, the DB schema (migration 013) would need an update.
    // Self-correction: schema for discovered_directories in step 4 does not have sc_focus_score.
    // It should be added or included in notes. For now, I'll add it to notes.
    status: status,
    last_validated_at: new Date().toISOString(),
    notes: `${notes}${classificationData?.sc_focus_score ? ` | SC Focus Score: ${classificationData.sc_focus_score}` : ''}`,
    // `added_at` is set on insert by default. `updated_at` will be handled by trigger.
  };

  try {
    // Check if the record exists
    const { data: existing, error: selectError } = await supabaseAdmin
      .from('discovered_directories')
      .select('id')
      .eq('url', candidateUrl)
      .maybeSingle();

    if (selectError) {
      console.error(`DirectoryClassifier: Error checking for existing directory ${candidateUrl}:`, selectError.message);
      // Optionally, still try to insert or handle error differently
      return;
    }

    if (existing) {
      // Update existing record
      console.info(`DirectoryClassifier: Updating existing directory record for ${candidateUrl}`);
      const { error: updateError } = await supabaseAdmin
        .from('discovered_directories')
        .update({
          ...dbRecord,
          updated_at: new Date().toISOString(), // Explicitly set updated_at as trigger might not cover all ORM cases
        })
        .eq('id', existing.id);

      if (updateError) {
        console.error(`DirectoryClassifier: Error updating directory ${candidateUrl} in Supabase:`, updateError.message);
      } else {
        console.info(`DirectoryClassifier: Successfully updated directory record for ${candidateUrl}. Status: ${status}`);
      }
    } else {
      // Insert new record
      console.info(`DirectoryClassifier: Inserting new directory record for ${candidateUrl}`);
      const { error: insertError } = await supabaseAdmin
        .from('discovered_directories')
        .insert({
          ...dbRecord,
          added_at: new Date().toISOString(), // ensure added_at is set
        });

      if (insertError) {
        console.error(`DirectoryClassifier: Error inserting new directory ${candidateUrl} into Supabase:`, insertError.message);
      } else {
        console.info(`DirectoryClassifier: Successfully inserted new directory record for ${candidateUrl}. Status: ${status}`);
      }
    }
  } catch (dbError: any) {
    console.error(`DirectoryClassifier: Database exception for ${candidateUrl}: ${dbError.message}`);
  }
}

// Example Usage (for testing)
/*
async function testClassifier() {
  // Make sure to have a valid URL that hasn't been processed or is okay to re-process
  const testUrl = "https://www.someprospecturl.com/directory"; // Replace with a real test URL
  if (testUrl !== "https://www.someprospecturl.com/directory") { // Simple check to ensure it's changed
    await classifyAndStoreDirectory(testUrl);
  } else {
    console.log("Please replace testUrl with a real URL to test the classifier.");
  }
}
// To test, you might need to ensure your Supabase and Firecrawl/Gemini environments are configured.
// testClassifier();
*/
