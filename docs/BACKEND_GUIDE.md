# Backend Guide

This document provides a guide to the backend codebase for the Food Truck Finder application.

## 1. Architecture

The backend is built with [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction). Next.js API Routes are a simple way to build a backend for a Next.js application. They are serverless functions that are deployed to Vercel.

The backend is organized into the following directories:

-   **`app/api/`**: Contains the API routes for the application.
-   **`lib/`**: Contains the core logic for the backend, including database interactions, external service integrations, and utility functions.

## 2. API Design

The API is designed to be RESTful. It uses standard HTTP methods (GET, POST, PUT, DELETE) and returns JSON responses.

The API routes are located in the `app/api` directory.

## 3. Database

The application uses [Supabase](https://supabase.io/) as its database. Supabase is a PostgreSQL database with a number of features that make it easy to build a backend, including authentication, real-time subscriptions, and auto-generated APIs.

The database schema is located in the `supabase/migrations` directory.

## 4. Authentication and Authorization

The application uses [Supabase Auth](https://supabase.io/docs/guides/auth) for authentication and authorization. Supabase Auth is a complete authentication solution that supports a variety of authentication methods, including email/password, OAuth, and magic links.

The authentication middleware is located in the `app/middleware.ts` file.
