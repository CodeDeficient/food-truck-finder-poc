# Frontend Guide

This document provides a guide to the frontend codebase for the Food Truck Finder application.

## 1. Architecture

The frontend is built with [Next.js](https://nextjs.org/), a React framework that provides a number of features out of the box, including server-side rendering, static site generation, and API routes.

The frontend is organized into the following directories:

-   **pp/**: Contains the pages and API routes for the application.
-   **components/**: Contains reusable React components.
-   **hooks/**: Contains custom React hooks.
-   **styles/**: Contains global stylesheets.

## 2. Component Library

The application uses [Shadcn UI](https://ui.shadcn.com/) as its component library. Shadcn UI is a collection of reusable components that are built on top of [Radix UI](https://www.radix-ui.com/) and [Tailwind CSS](https://tailwindcss.com/).

The components are located in the components/ui directory.

### 2.1 Modal Component System

**Latest Update (Aug 2025):** The application now features a unified Modal Component System that consolidates all modal functionality into a single, accessible, and performant system.

#### Modal Variants Available:
- **SimpleModal**: Basic alerts and confirmations with action buttons
- **ContentModal**: Complex layouts with custom content and scrolling
- **FormModal**: Form submissions with validation and error handling  
- **ConfirmationModal**: Confirm/cancel actions with promise-based API

#### Usage Example:
`	sx
import { Modal, useModal } from '@/components/ui/Modal';

const modal = useModal();

// Simple confirmation
<Modal 
  variant="simple" 
  isOpen={modal.isOpen} 
  onClose={modal.close}
  title="Confirm Action"
  actions={[
    { label: 'Cancel', variant: 'outline', onClick: modal.close },
    { label: 'Confirm', variant: 'default', onClick: handleConfirm }
  ]}
/>

// Complex content with scrolling
<Modal 
  variant="content" 
  isOpen={modal.isOpen} 
  onClose={modal.close}
  title="Food Truck Details"
  size="lg"
  scrollable={true}
>
  <TruckDetailsContent truck={truck} />
</Modal>
`

#### Key Features:
- **WCAG 2.1 AA Compliant**: Built-in accessibility with screen reader support
- **Performance Optimized**: Sub-100ms render times across all variants
- **Type Safe**: Comprehensive TypeScript interfaces
- **Responsive**: Mobile-first design with touch-friendly interfaces
- **Hook Integration**: Advanced state management with useModal, useFormModal, useConfirmationModal

For comprehensive documentation, see /staging/ui-specialist-1/Modal-API-Documentation.md.

## 3. State Management

The application uses [Zustand](https://zustand-demo.pmnd.rs/) for state management. Zustand is a small, fast, and scalable state management library for React.

The Zustand stores are located in the hooks directory.

## 4. Styling

The application uses [Tailwind CSS](https://tailwindcss.com/) for styling. Tailwind CSS is a utility-first CSS framework that makes it easy to build custom designs without writing any custom CSS.

The global stylesheets are located in the styles directory.
