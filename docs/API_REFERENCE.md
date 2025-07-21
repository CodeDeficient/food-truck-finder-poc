# API Reference

This document provides a detailed reference for the API endpoints in the Food Truck Finder application.

## 1. Authentication

All API endpoints are protected by the authentication middleware. To access the API, you will need to be logged in as a user with the appropriate role.

## 2. API Routes

### `/api/search`
- **Method:** `GET`
- **Description:** Searches for food trucks based on a query and filters.
- **Query Parameters:**
    - `q`: The search query.
    - `cuisine`: The cuisine type to filter by.
    - `distance`: The maximum distance to search within.
    - `price`: The price range to filter by.
- **Response:** A JSON object containing a list of food trucks that match the search criteria.

### `/api/trucks`
- **Method:** `GET`
- **Description:** Gets a list of all food trucks.
- **Response:** A JSON object containing a list of all food trucks.

### `/api/trucks/[id]`
- **Method:** `GET`
- **Description:** Gets the details for a specific food truck.
- **Path Parameters:**
    - `id`: The ID of the food truck.
- **Response:** A JSON object containing the details for the specified food truck.

### `/api/events`
- **Method:** `GET`
- **Description:** Gets a list of all events.
- **Response:** A JSON object containing a list of all events.

### `/api/scrape`
- **Method:** `POST`
- **Description:** Manually triggers the web scraper.
- **Request Body:** A JSON object containing the URL to scrape.
- **Response:** A JSON object containing the results of the scrape.

### `/api/auto-scrape-initiate`
- **Method:** `POST`
- **Description:** Initiates the auto-scraping process.
- **Response:** A JSON object containing a message indicating that the auto-scraping process has been initiated.

### `/api/cron/auto-scrape`
- **Method:** `GET`
- **Description:** The endpoint for the auto-scraping cron job.
- **Response:** A JSON object containing a message indicating that the cron job has been executed.

### `/api/cron/quality-check`
- **Method:** `GET`
- **Description:** The endpoint for the data quality check cron job.
- **Response:** A JSON object containing a message indicating that the cron job has been executed.

### `/api/pipeline`
- **Method:** `POST`
- **Description:** Triggers and manages data pipeline runs.
- **Request Body:** A JSON object containing the pipeline configuration.
- **Response:** A JSON object containing the results of the pipeline run.

### `/api/gemini`
- **Method:** `POST`
- **Description:** Handles interactions with the Gemini AI model.
- **Request Body:** A JSON object containing the prompt for the Gemini model.
- **Response:** A JSON object containing the response from the Gemini model.
