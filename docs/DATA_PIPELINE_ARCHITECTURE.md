# Data Pipeline Architecture

This document outlines the architecture of the data pipeline for the Food Truck Finder application, with a focus on the classification of scraped entities.

## 1. Entity Classification Strategy

To address the issue of misclassifying scraped data, we will implement a multi-tiered classification system. The goal is to accurately categorize each scraped URL as one of the following types: `food_truck`, `event`, or `source_directory`.

### 1.1. Classification Tiers

The classification process will proceed through the following tiers, stopping as soon as a confident classification is made:

1.  **Tier 1: URL Pattern Analysis (Heuristic)**
    *   **Logic:** Analyze the URL for keywords that strongly indicate a specific category.
    *   **Examples:**
        *   If URL contains `/events/`, classify as `event`.
        *   If URL contains `/directory/` or `/list/`, classify as `source_directory`.
    *   **Pros:** Very fast, zero cost.
    *   **Cons:** Can be brittle if sites don't use clear URL structures.

2.  **Tier 2: On-Page Keyword Analysis (Heuristic)**
    *   **Logic:** Scan the page's `<h1>`, `<h2>`, and `<title>` tags for keywords.
    *   **Examples:**
        *   Keywords like "Festival," "Fair," "Market" suggest `event`.
        *   Keywords like "Directory," "List of," "Find Food Trucks" suggest `source_directory`.
    *   **Pros:** Still fast and zero cost. More robust than URL analysis alone.
    *   **Cons:** Can be fooled by ambiguous language.

3.  **Tier 3: AI-Powered Classification (Gemini)**
    *   **Logic:** If the heuristic tiers fail to produce a confident classification, send the page content (or a summary) to the Gemini API with a prompt specifically designed for this classification task.
    *   **Prompt Example:** "Classify the following webpage content as either 'food_truck', 'event', or 'source_directory'. Provide only the classification in your response. Content: [Page Content]"
    *   **Pros:** Highest accuracy.
    *   **Cons:** Higher latency and potential cost associated with API calls. This will be used as a fallback to minimize cost.

### 1.2. Implementation Plan

1.  **Modify `lib/pipelineProcessor.ts`:** The core logic for this classification system will be implemented within the `pipelineProcessor`. A new function, `classifyScrapedEntity`, will be created to encapsulate the tiered logic.
2.  **Update Supabase Schema:** New tables for `events` and `source_directories` will be created to store the classified data. The `food_trucks` table will only store entities classified as `food_truck`.
3.  **Integrate with Scraping Engine:** The `ScraperEngine` will call the `classifyScrapedEntity` function after fetching the content of a URL and before any data extraction occurs.

This hybrid approach balances speed, cost, and accuracy, ensuring that we can efficiently and correctly categorize the data that powers our application.
