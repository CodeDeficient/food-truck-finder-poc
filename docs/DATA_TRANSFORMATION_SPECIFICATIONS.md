# Data Transformation Specifications

This document explains how data is cleaned, transformed, and processed in the Food Truck Finder application.

## 1. Data Cleaning

The raw data that is scraped from websites is often messy and inconsistent. The data pipeline includes a number of steps to clean the data, including:

-   **Removing HTML tags:** The pipeline removes all HTML tags from the scraped data.
-   **Normalizing data:** The pipeline normalizes the data to a consistent format. For example, it converts all dates to a standard format and all phone numbers to a standard format.
-   **Removing duplicates:** The pipeline removes any duplicate records from the data.

## 2. Data Enrichment

The data pipeline also enriches the data with additional information. For example, it uses the Google Maps API to geocode addresses and to get the latitude and longitude for each food truck.

## 3. Data Validation

The data pipeline includes a number of steps to validate the data. For example, it checks that all required fields are present and that all data is in the correct format.

## 4. Data Processing

The cleaned, enriched, and validated data is then processed by the Gemini AI model. The Gemini model is used to extract and structure the information into a consistent format.

## 5. Data Storage

The cleaned and structured data is stored in the `food_trucks`, `events`, and `food_truck_schedules` tables in the Supabase database.
