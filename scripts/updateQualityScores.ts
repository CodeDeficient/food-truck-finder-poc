import { supabase } from '@/lib/supabase';
import cron from 'node-cron';
import { calculateQualityScore } from '../lib/quality/qualityScorer';

// Define a function to update the quality scores in the database
type QualityScoreUpdate = {
  id: string;
  score: number;
  grade: string;
};

async function updateQualityScores() {
  const { data: trucks, error } = await supabase.from('food_trucks').select('*');
  if (error) {
    console.error('Error fetching food trucks:', error);
    return;
  }

  const updates = trucks.map((truck) => {
    const validationResult = { critical: [], warnings: [] }; // Assume this is fetched
    const { score, grade } = calculateQualityScore(truck, validationResult);
    return { id: truck.id, score, grade };
  });

  for (const update of updates) {
    const { error: updateError } = await supabase
      .from('food_trucks')
      .update({ data_quality_score: update.score, quality_grade: update.grade })
      .eq('id', update.id);
    if (updateError) {
      console.error(`Error updating quality score for truck ${update.id}:`, updateError);
    }
  }
}

// Schedule nightly aggregation job
cron.schedule('0 0 * * *', async () => {
  console.log('Running nightly quality score update...');
  await updateQualityScores();
  console.log('Quality scores updated successfully.');
});

