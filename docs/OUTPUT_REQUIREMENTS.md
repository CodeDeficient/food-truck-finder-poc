# Output Requirements

This document defines what the data pipeline produces, such as reports, databases, or APIs.

## 1. Database Tables

The primary output of the data pipeline is a set of cleaned and structured data that is stored in the following Supabase database tables:

-   **`food_trucks`**: Stores information about food trucks.
-   **`events`**: Stores information about events.
-   **`food_truck_schedules`**: Stores the schedules for food trucks at events.

## 2. API Endpoints

The data pipeline also exposes a number of API endpoints that can be used to access the data. These endpoints are described in detail in the `docs/API_REFERENCE.md` file.

## 3. Admin Dashboard

The data pipeline provides data to the admin dashboard, which can be used to monitor the quality of the data and the status of the pipeline.

## 4. Reports

The data pipeline does not currently produce any reports. However, it could be extended to produce reports in the future, such as a daily summary of new food trucks that have been discovered.
