# Data Quality Guide

This document defines the metrics, weights, and scoring system used to calculate the data quality score for each food truck in the Food Truck Finder application.

## 1. Data Quality Dimensions

Our data quality score is a composite metric based on the following dimensions, which are aligned with industry best practices:

-   **Completeness:** Do we have all the essential information for a food truck?
-   **Accuracy:** Is the information we have correct and verifiable?
-   **Timeliness:** Is the information up-to-date?
-   **Uniqueness:** Is this a unique food truck entry, not a duplicate?
-   **Validity:** Is the data in the correct format?

## 2. Weighted Scoring System

Each data point for a food truck is assigned a weight based on its importance to the user experience. The final quality score is the sum of the weights for all present and valid data points, normalized to a scale of 0 to 100.

| Data Point              | Weight | Dimension(s)                  | Description                                                                 |
| ----------------------- | ------ | ----------------------------- | --------------------------------------------------------------------------- |
| **Name**                | 15     | Completeness, Uniqueness      | The official name of the food truck. Essential for identification.          |
| **Cuisine Type**        | 10     | Completeness                  | The type of food served (e.g., Tacos, BBQ). Critical for user filtering.    |
| **Recent GPS Location** | 20     | Completeness, Timeliness      | GPS coordinates updated within the last 24 hours. The most critical data point. |
| **Menu URL/Data**       | 15     | Completeness                  | A link to a menu or structured menu data. A primary decision factor for users. |
| **Operating Hours**     | 10     | Completeness, Timeliness      | Stated operating hours. Helps users know when to visit.                     |
| **Website/Social Media**| 10     | Completeness                  | A link to an official website or social media page.                           |
| **Image URL**           | 10     | Completeness                  | A photo of the food truck. Improves user engagement.                        |
| **Address**             | 5      | Completeness                  | A physical address, used for geocoding if GPS is not available.             |
| **Phone Number**        | 5      | Completeness, Validity        | A valid phone number.                                                       |
| **Total**               | **100**  |                               |                                                                             |

### 2.1. Scoring Logic

-   The score is calculated by summing the weights of all available and valid fields.
-   For the **Recent GPS Location**, the full 20 points are awarded only if the location's timestamp is less than 24 hours old. The score degrades linearly to 0 points over 7 days.
-   The final score is presented as a percentage (e.g., a score of 75 is displayed as 75%).

## 3. Quality Categories

Based on the final score, each food truck is assigned a quality category:

-   **High Quality:** 80 - 100
-   **Medium Quality:** 60 - 79
-   **Low Quality:** 0 - 59

This scoring system provides a clear, actionable, and transparent way to measure and improve the quality of our data, directly aligning with our goal of providing the best possible experience for our users.
