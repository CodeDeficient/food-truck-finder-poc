# Usage Guide

This guide provides an overview of the main features of the Food Truck Finder application and how to use them.

## 1. Main Commands

The following commands are available in the project:

-   **`npm run dev`**: Starts the development server on `http://localhost:3000`.
-   **`npm run build`**: Creates an optimized production build of the application.
-   **`npm start`**: Starts the production server on `http://localhost:3000`.
-   **`npm run lint`**: Lints the codebase for errors and warnings.
-   **`npm run test`**: Runs the test suite.

## 2. Core User Flows

### 2.1. Searching for a Food Truck

1.  **Navigate to the Home Page:** Open your browser and go to `http://localhost:3000`.
2.  **Use the Search Bar:** Enter a search query in the search bar at the top of the page. You can search by food truck name, cuisine type, or location.
3.  **Apply Filters:** Use the filters on the left side of the page to narrow down your search results. You can filter by cuisine type, distance, and price range.
4.  **View Results:** The search results will be displayed in a list on the left side of the page and as markers on the map on the right side of the page.

### 2.2. Viewing Food Truck Details

1.  **Click on a Food Truck:** Click on a food truck in the search results list or on a marker on the map to view its details.
2.  **View Details:** A modal window will open with detailed information about the food truck, including its menu, operating hours, and contact information.

## 3. Admin Dashboard

The admin dashboard is located at `/admin`. To access it, you will need to be logged in as an admin.

### 3.1. Main Features

-   **Analytics:** View analytics data for the application.
-   **Data Quality:** Monitor the quality of the food truck data.
-   **User Management:** Manage users and their roles.
-   **Pipeline Monitoring:** Monitor the status of the data pipeline.
