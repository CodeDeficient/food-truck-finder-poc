# Data Model Documentation

This document provides a detailed overview of the database schema for the Food Truck Finder application.

## 1. Entity-Relationship Diagram

```mermaid
erDiagram
    users {
        uuid id PK
        timestamp created_at
        text email
        text role
    }

    profiles {
        uuid id PK
        uuid user_id FK
        text username
        text full_name
        text avatar_url
        timestamp updated_at
    }

    food_trucks {
        uuid id PK
        timestamp created_at
        text name
        text description
        text location_lat
        text location_long
        text opening_hours
        text website
        text menu_url
        text contact_info
        text social_media
        text cuisine_type
        text price_range
    }

    events {
        uuid id PK
        timestamp created_at
        text name
        text description
        timestamp start_time
        timestamp end_time
        text location_name
        text location_lat
        text location_long
    }

    food_truck_schedules {
        uuid id PK
        uuid food_truck_id FK
        uuid event_id FK
        timestamp start_time
        timestamp end_time
        text location_details
    }

    scraper_configs {
        uuid id PK
        timestamp created_at
        text name
        text config_json
        boolean is_active
        timestamp last_run
        text status
    }

    api_usage_logs {
        uuid id PK
        timestamp created_at
        uuid user_id FK
        text endpoint
        text method
        integer response_status
        integer response_time_ms
    }

    data_quality_metrics {
        uuid id PK
        timestamp created_at
        uuid food_truck_id FK
        text metric_name
        numeric metric_value
        text details
    }

    discovered_urls {
        uuid id PK
        text url UNIQUE NOT NULL
        text source_directory_url
        text region
        text status
        text discovery_method
        timestamp discovered_at
        timestamp last_processed_at
        integer processing_attempts
        text notes
        jsonb metadata
        timestamp created_at
        timestamp updated_at
    }

    users ||--o{ profiles : "has"
    food_trucks ||--o{ food_truck_schedules : "has"
    events ||--o{ food_truck_schedules : "has"
    users ||--o{ api_usage_logs : "generates"
    food_trucks ||--o{ data_quality_metrics : "monitors"
    discovered_urls ||--o{ scraper_configs : "uses"
```

## 2. Table Descriptions

### `users`
- **Description:** Stores authentication information for users.
- **Columns:**
    - `id`: Primary key (UUID).
    - `created_at`: Timestamp of when the user was created.
    - `email`: User's email address.
    - `role`: User's role (e.g., `user`, `admin`).

### `profiles`
- **Description:** Stores public profile information for users.
- **Columns:**
    - `id`: Primary key (UUID).
    - `user_id`: Foreign key to the `users` table.
    - `username`: User's username.
    - `full_name`: User's full name.
    - `avatar_url`: URL for the user's avatar image.
    - `updated_at`: Timestamp of when the profile was last updated.

### `food_trucks`
- **Description:** Stores information about food trucks.
- **Columns:**
    - `id`: Primary key (UUID).
    - `created_at`: Timestamp of when the food truck was created.
    - `name`: Name of the food truck.
    - `description`: Description of the food truck.
    - `location_lat`: Latitude of the food truck's location.
    - `location_long`: Longitude of the food truck's location.
    - `opening_hours`: Opening hours of the food truck.
    - `website`: URL for the food truck's website.
    - `menu_url`: URL for the food truck's menu.
    - `contact_info`: Contact information for the food truck.
    - `social_media`: Social media links for the food truck.
    - `cuisine_type`: Type of cuisine served by the food truck.
    - `price_range`: Price range of the food truck.

### `events`
- **Description:** Stores information about events.
- **Columns:**
    - `id`: Primary key (UUID).
    - `created_at`: Timestamp of when the event was created.
    - `name`: Name of the event.
    - `description`: Description of the event.
    - `start_time`: Start time of the event.
    - `end_time`: End time of the event.
    - `location_name`: Name of the event's location.
    - `location_lat`: Latitude of the event's location.
    - `location_long`: Longitude of the event's location.

### `food_truck_schedules`
- **Description:** Stores the schedules for food trucks at events.
- **Columns:**
    - `id`: Primary key (UUID).
    - `food_truck_id`: Foreign key to the `food_trucks` table.
    - `event_id`: Foreign key to the `events` table.
    - `start_time`: Start time of the food truck's appearance at the event.
    - `end_time`: End time of the food truck's appearance at the event.
    - `location_details`: Additional details about the food truck's location at the event.

### `scraper_configs`
- **Description:** Stores configurations for the web scrapers.
- **Columns:**
    - `id`: Primary key (UUID).
    - `created_at`: Timestamp of when the scraper config was created.
    - `name`: Name of the scraper config.
    - `config_json`: JSON object containing the scraper configuration.
    - `is_active`: Whether the scraper config is active.
    - `last_run`: Timestamp of when the scraper was last run.
    - `status`: Status of the scraper.

### `api_usage_logs`
- **Description:** Stores logs of API usage.
- **Columns:**
    - `id`: Primary key (UUID).
    - `created_at`: Timestamp of when the API call was made.
    - `user_id`: Foreign key to the `users` table.
    - `endpoint`: The API endpoint that was called.
    - `method`: The HTTP method of the API call.
    - `response_status`: The HTTP status code of the response.
    - `response_time_ms`: The response time of the API call in milliseconds.

### `data_quality_metrics`
- **Description:** Stores data quality metrics for food trucks.
- **Columns:**
    - `id`: Primary key (UUID).
    - `created_at`: Timestamp of when the metric was created.
    - `food_truck_id`: Foreign key to the `food_trucks` table.
    - `metric_name`: Name of the metric.
    - `metric_value`: Value of the metric.
    - `details`: Additional details about the metric.

### `discovered_urls`
- **Description:** Stores URLs that have been discovered by the data pipeline.
- **Columns:**
    - `id`: Primary key (UUID).
    - `url`: The discovered URL.
    - `source_directory_url`: The URL of the directory where the URL was discovered.
    - `region`: The region of the URL.
    - `status`: The status of the URL (e.g., `new`, `processing`, `processed`).
    - `discovery_method`: The method by which the URL was discovered.
    - `discovered_at`: Timestamp of when the URL was discovered.
    - `last_processed_at`: Timestamp of when the URL was last processed.
    - `processing_attempts`: Number of times the URL has been processed.
    - `notes`: Additional notes about the URL.
    - `metadata`: JSON object containing additional metadata about the URL.
    - `created_at`: Timestamp of when the URL was created.
    - `updated_at`: Timestamp of when the URL was last updated.
