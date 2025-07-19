# UI Design Guide

This document outlines the design language, component strategy, and implementation plan for the UI/UX overhaul of the Food Truck Finder application.

## 1. Aesthetic Vision

The goal is to create a modern, visually engaging interface that is both beautiful and intuitive. The core aesthetic will be a **"Cyber-Diner"** theme, blending futuristic and retro elements.

-   **Primary Style:** Black Glassmorphism
-   **Accent Elements:** Red Neon Glows
-   **Typography:** A clean, modern sans-serif for body text, with a stylized, retro-futuristic font for headers.
-   **Iconography:** Minimalist, line-art icons with a subtle neon glow on hover/focus.

## 2. Component & Implementation Strategy

### 2.1. Component Library

-   **Foundation:** We will continue to use `shadcn/ui` as our base component library, as it is already integrated into the project.
-   **Glassmorphism Effects:** We will integrate the `glasscn-ui` library, which extends `shadcn/ui` with pre-built glassmorphism variants. This will allow us to apply the glass effect to container components like cards, dialogs, and popovers with simple props.
-   **Custom Styles:** For the neon glow effects and other custom styling, we will use Tailwind CSS utility classes and custom CSS variables defined in `app/globals.css`.

### 2.2. Implementation Plan

1.  **Install `glasscn-ui`:** Add the `glasscn-ui` package to the project's dependencies.
2.  **Configure `tailwind.config.ts`:** Update the Tailwind configuration to include the necessary plugins and variants from `glasscn-ui`.
3.  **Update Global Styles:** Add the base styles and CSS variables for our color palette (deep blacks, neon reds) and fonts to `app/globals.css`.
4.  **Refactor Core Components:** Systematically refactor the core UI components in `components/ui/` (e.g., `Card`, `Button`, `Badge`) to use the new `glass` variants and neon styles.
5.  **Apply New Styles to Feature Components:** Once the core components are updated, apply the new styles to the feature-specific components throughout the application.

This strategy allows us to leverage our existing component library while incorporating the desired new aesthetic in a systematic and maintainable way.
