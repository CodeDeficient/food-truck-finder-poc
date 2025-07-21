# Deployment Plan

This document provides steps and procedures for deploying the Food Truck Finder application and its data pipeline to production.

## 1. Deployment Platform

The application is deployed on [Vercel](https://vercel.com/). Vercel is a cloud platform for static sites and serverless functions that is optimized for Next.js applications.

## 2. Continuous Deployment

The application is configured for continuous deployment. Every time a new commit is pushed to the `main` branch of the GitHub repository, a new deployment is automatically triggered on Vercel.

## 3. Environment Variables

The application uses a number of environment variables to store sensitive information, such as API keys and database credentials. These environment variables are stored in Vercel and are not checked into the Git repository.

## 4. Database Migrations

The database schema is managed with Supabase migrations. To apply new migrations to the production database, you will need to run the following command:

```bash
npx supabase db push
```

## 5. Rollbacks

Vercel makes it easy to roll back to a previous deployment if something goes wrong. You can do this from the Vercel dashboard.
