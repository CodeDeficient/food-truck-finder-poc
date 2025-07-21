# Data Source Specifications

This document describes the data sources for the Food Truck Finder application, including their formats, access methods, and any other relevant details.

## 1. Primary Data Sources

The primary data sources for the Food Truck Finder application are the websites and APIs of individual food trucks and event organizers.

-   **Format:** HTML, JSON, XML
-   **Access Method:** HTTP GET requests

## 2. Discovery Mechanisms

The data pipeline uses the following mechanisms to discover new data sources:

-   **Tavily AI:** The pipeline uses Tavily's AI-powered search API to intelligently discover new food trucks and their websites.
-   **Firecrawl:** The pipeline uses Firecrawl to crawl directories and other websites to find links to food truck websites.

## 3. Data Ingestion

The data pipeline uses the following tools to ingest data from the data sources:

-   **Firecrawl:** Firecrawl is used to reliably scrape data from websites.
-   **Custom Scrapers:** The pipeline also includes custom scrapers for websites that are difficult to scrape with Firecrawl.

## 4. Data Storage

The raw, unprocessed data is stored in the `discovered_urls` table in the Supabase database. The cleaned and structured data is stored in the `food_trucks`, `events`, and `food_truck_schedules` tables.
