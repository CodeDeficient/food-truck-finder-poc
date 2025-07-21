# Installation Guide

This guide provides step-by-step instructions for setting up the Food Truck Finder project for local development.

## 1. System Requirements

-   **Node.js:** Version 18.17.0 or higher.
-   **npm:** Version 8.0.0 or higher.

## 2. Environment Setup

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/CodeDeficient/food-truck-finder-poc.git
    cd food-truck-finder-poc
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Set Up Environment Variables:**
    -   Create a new file named `.env.local` in the root of the project.
    -   Add the following environment variables to the file:
        ```
        NEXT_PUBLIC_SUPABASE_URL="your_supabase_url"
        NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key"
        ```
    -   You can get these values from your Supabase project dashboard.

## 3. Running the Development Server

Once you have completed the environment setup, you can start the development server with the following command:

```bash
npm run dev
```

This will start the development server on `http://localhost:3000`.

## 4. Building for Production

To create a production build of the application, run the following command:

```bash
npm run build
```

This will create an optimized production build in the `.next` directory.

## 5. Running in Production Mode

To run the application in production mode, you first need to create a production build (see step 4). Then, you can start the production server with the following command:

```bash
npm start
```

This will start the production server on `http://localhost:3000`.
