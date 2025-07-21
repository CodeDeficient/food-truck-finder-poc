# Frontend Guide

This document provides a guide to the frontend codebase for the Food Truck Finder application.

## 1. Architecture

The frontend is built with [Next.js](https://nextjs.org/), a React framework that provides a number of features out of the box, including server-side rendering, static site generation, and API routes.

The frontend is organized into the following directories:

-   **`app/`**: Contains the pages and API routes for the application.
-   **`components/`**: Contains reusable React components.
-   **`hooks/`**: Contains custom React hooks.
-   **`styles/`**: Contains global stylesheets.

## 2. Component Library

The application uses [Shadcn UI](https://ui.shadcn.com/) as its component library. Shadcn UI is a collection of reusable components that are built on top of [Radix UI](https://www.radix-ui.com/) and [Tailwind CSS](https://tailwindcss.com/).

The components are located in the `components/ui` directory.

## 3. State Management

The application uses [Zustand](https://zustand-demo.pmnd.rs/) for state management. Zustand is a small, fast, and scalable state management library for React.

The Zustand stores are located in the `hooks` directory.

## 4. Styling

The application uses [Tailwind CSS](https://tailwindcss.com/) for styling. Tailwind CSS is a utility-first CSS framework that makes it easy to build custom designs without writing any custom CSS.

The global stylesheets are located in the `styles` directory.
