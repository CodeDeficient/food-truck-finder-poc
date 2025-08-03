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

-   **Foundation:** We will continue to use shadcn/ui as our base component library, as it is already integrated into the project.
-   **Glassmorphism Effects:** We will integrate the glasscn-ui library, which extends shadcn/ui with pre-built glassmorphism variants. This will allow us to apply the glass effect to container components like cards, dialogs, and popovers with simple props.
-   **Custom Styles:** For the neon glow effects and other custom styling, we will use Tailwind CSS utility classes and custom CSS variables defined in pp/globals.css.

### 2.2. Modal Component System (August 2025 Update)

**Major Achievement:** We now have a unified Modal Component System that serves as the foundation for all modal interactions across the application.

#### Design Standards Applied:
- **Consistent Glass Effects**: All modals use standardized glassmorphism styling
- **Neon Accent Integration**: Modal actions and focus states incorporate neon glow effects
- **Theme Awareness**: Full support for dark/light themes with cyber-diner aesthetic
- **Responsive Design**: Mobile-first approach with touch-friendly interfaces

#### Implementation:
`	sx
// Cyber-diner themed modal with glass effects
<Modal 
  variant="content" 
  isOpen={isOpen} 
  onClose={onClose}
  title="Food Truck Details"
  className="glass" // Applies glassmorphism effect
  size="lg"
>
  <div className="neon-border p-6">
    {/* Content with neon accent styling */}
  </div>
</Modal>
`

#### Accessibility Integration:
- **High Contrast Support**: All neon effects maintain WCAG AA color contrast ratios
- **Focus Indicators**: Neon glow effects double as accessibility focus indicators
- **Screen Reader Optimization**: Glass effects don't interfere with assistive technology

### 2.3. Implementation Plan

1.  **Install glasscn-ui:** Add the glasscn-ui package to the project's dependencies.
2.  **Configure 	ailwind.config.ts:** Update the Tailwind configuration to include the necessary plugins and variants from glasscn-ui.
3.  **Update Global Styles:** Add the base styles and CSS variables for our color palette (deep blacks, neon reds) and fonts to pp/globals.css.
4.  **Refactor Core Components:** Systematically refactor the core UI components in components/ui/ (e.g., Card, Button, Badge) to use the new glass variants and neon styles.
5.  **Apply New Styles to Feature Components:** Once the core components are updated, apply the new styles to the feature-specific components throughout the application.
6.  **✅ Modal System Complete:** The unified modal system already implements the cyber-diner theme with glass effects and neon accents.

This strategy allows us to leverage our existing component library while incorporating the desired new aesthetic in a systematic and maintainable way.

## 3. Modal Component Standards

All modals in the application follow these design principles:

### Visual Hierarchy
- **Glass Container**: Semi-transparent background with backdrop blur
- **Neon Accents**: Primary actions use red neon glow effects  
- **Typography Scale**: Consistent font sizing with cyber-diner headers
- **Spacing System**: Uniform padding and margins using design tokens

### Interaction Patterns
- **Hover States**: Subtle neon glow on interactive elements
- **Focus Management**: Visible focus rings with neon styling
- **Loading States**: Animated neon pulse effects for processing states
- **Error States**: Red neon alerts with clear iconography

### Responsive Behavior
- **Mobile Adaptation**: Touch-friendly sizing with optimized glass effects
- **Viewport Scaling**: Flexible sizing that maintains readability
- **Performance**: Optimized CSS for smooth animations on all devices

The unified modal system serves as the reference implementation for applying the cyber-diner aesthetic consistently across all UI components.
