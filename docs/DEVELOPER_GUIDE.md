# Developer Guide

This guide provides comprehensive information for developers working on the Food Truck Finder application, including development practices, tools, and design workflows.

## Table of Contents

1. [Development Environment Setup](#development-environment-setup)
2. [Using Screenshots for Mock-ups](#using-screenshots-for-mock-ups)
3. [Development Best Practices](#development-best-practices)
4. [Code Quality Standards](#code-quality-standards)
5. [Testing Guidelines](#testing-guidelines)

## Development Environment Setup

### Prerequisites

- Node.js 18.17.0 or higher
- npm or pnpm package manager
- Git for version control
- Your preferred code editor (VS Code recommended)

### Initial Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/codedeficients/food-truck-finder-poc.git
   cd food-truck-finder-poc
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Environment Configuration**:
   - Copy `.env.local.example` to `.env.local`
   - Fill in required environment variables
   - **⚠️ NEVER use `vercel env pull`** - This will overwrite your local environment variables

4. **Start development server**:
   ```bash
   npm run dev
   ```

## Using Screenshots for Mock-ups

Screenshots are a powerful tool for rapid prototyping and communicating design ideas in future development iterations. This section documents best practices for using screenshots effectively in the development workflow.

### When to Use Screenshots for Mock-ups

Screenshots are particularly useful for:

- **Rapid UI iterations**: Quickly visualize changes without full implementation
- **Design communication**: Share visual concepts with team members or stakeholders
- **Component planning**: Mock up new components before coding
- **Layout experimentation**: Test different arrangements and spacing
- **User flow documentation**: Illustrate complete user journeys
- **Bug reporting**: Show expected vs. actual visual states

### Screenshot Best Practices

#### 1. Capture Standards

- **Resolution**: Use consistent screen resolutions (1920x1080 recommended)
- **Browser**: Standardize on one browser for consistency (Chrome recommended)
- **Zoom level**: Always use 100% zoom unless testing responsive behavior
- **Window size**: Use standard viewport sizes:
  - Desktop: 1920x1080
  - Tablet: 768x1024
  - Mobile: 375x667 (iPhone SE) or 390x844 (iPhone 12)

#### 2. Naming Conventions

Use descriptive filenames that include:
- Component/page name
- State or variant
- Date (YYYY-MM-DD format)
- Resolution if multiple sizes

Examples:
```
truck-card-mockup-hover-state-2025-01-15-desktop.png
search-filters-expanded-2025-01-15-mobile.png
admin-dashboard-loading-state-2025-01-15.png
```

#### 3. Organization Structure

Store screenshots in a dedicated directory structure:

```
docs/
├── mockups/
│   ├── components/
│   │   ├── truck-card/
│   │   ├── search-filters/
│   │   └── navigation/
│   ├── pages/
│   │   ├── home/
│   │   ├── search/
│   │   └── admin/
│   ├── user-flows/
│   │   ├── onboarding/
│   │   ├── search-to-details/
│   │   └── admin-workflow/
│   └── iterations/
│       ├── v1-initial/
│       ├── v2-responsive/
│       └── v3-accessibility/
```

#### 4. Annotation Guidelines

- **Use tools** like Figma, Sketch, or even simple image editors
- **Mark interactive elements** with colored borders or arrows
- **Add notes** for functionality not visible in static images
- **Highlight changes** when showing iterations
- **Include context** about device, browser, or user state

#### 5. Documentation Integration

Link screenshots in documentation using relative paths:

```markdown
## Component Variations

### Default State
![Truck Card Default](../mockups/components/truck-card/default-state-2025-01-15.png)

### Hover State
![Truck Card Hover](../mockups/components/truck-card/hover-state-2025-01-15.png)

### Loading State
![Truck Card Loading](../mockups/components/truck-card/loading-state-2025-01-15.png)
```

### Tools and Utilities

#### Recommended Screenshot Tools

- **macOS**: 
  - Built-in: `Cmd+Shift+4` for selection, `Cmd+Shift+5` for advanced options
  - Third-party: CleanShot X, Kap (for animated GIFs)

- **Windows**:
  - Built-in: Snipping Tool, `Win+Shift+S`
  - Third-party: Greenshot, ShareX

- **Cross-platform**:
  - Browser extensions: Awesome Screenshot, Full Page Screen Capture
  - Design tools: Figma (with design handoff), Sketch

#### Automation Scripts

For consistent screenshots, consider creating automation scripts:

```bash
# Example script for capturing component screenshots
npm run screenshot:components
npm run screenshot:pages
npm run screenshot:responsive
```

### Integration with Development Workflow

#### 1. Feature Planning Phase

- Create initial mockups before coding
- Document user interactions and states
- Plan responsive behavior across devices
- Share with team for early feedback

#### 2. Implementation Phase

- Reference mockups during component development
- Update screenshots as implementation progresses
- Document any deviations from original mockups

#### 3. Review Phase

- Compare implementation with mockups
- Update documentation with final screenshots
- Archive iteration screenshots for reference

#### 4. Testing Phase

- Use screenshots for visual regression testing
- Document bug states with annotated screenshots
- Create reference images for automated visual tests

### Mock-up to Code Workflow

#### 1. Analysis Phase

Before coding from a screenshot mockup:

- **Identify components**: Break down the UI into reusable components
- **Plan state management**: Determine what data the UI needs
- **Consider responsive behavior**: How should it adapt to different screens?
- **Plan interactions**: What happens on hover, click, focus?

#### 2. Component Planning

Create a component hierarchy from the mockup:

```
TruckCard/
├── TruckImage
├── TruckInfo/
│   ├── TruckName
│   ├── CuisineType
│   └── Rating
├── LocationInfo
└── ActionButtons/
    ├── ViewDetails
    └── GetDirections
```

#### 3. Implementation Strategy

- Start with static layout matching the mockup
- Add interactivity progressively
- Implement responsive behavior
- Add loading and error states
- Test across different screen sizes

### Version Control for Screenshots

#### Git Considerations

- **Use Git LFS** for large screenshot files
- **Organize commits** by grouping related screenshots
- **Write descriptive commit messages** for design changes

```bash
git add docs/mockups/components/truck-card/
git commit -m "Add truck card component mockups for mobile and desktop variants"
```

#### Change Tracking

When updating designs:

- Keep previous versions in `iterations/` subdirectories
- Document reasons for changes in commit messages
- Link to relevant issues or feature requests

### Collaboration Guidelines

#### Design Reviews

- **Share mockups early** in the development process
- **Use consistent annotation styles** across team members
- **Document feedback** directly on screenshots or in linked issues
- **Version mockups** when incorporating feedback

#### Communication

- **Reference mockups** in pull requests and issues
- **Link to specific screenshots** when discussing implementation details
- **Update mockups** when requirements change
- **Archive outdated mockups** but keep them accessible for reference

### Quality Assurance

#### Screenshot Quality Checklist

- [ ] Consistent resolution and zoom level
- [ ] Clean browser environment (no extra toolbars, bookmarks visible)
- [ ] Realistic content (no Lorem Ipsum unless intentional)
- [ ] Proper lighting and contrast for visibility
- [ ] Annotations are clear and readable
- [ ] File size is optimized for web viewing

#### Regular Maintenance

- **Review screenshot library** quarterly
- **Remove outdated mockups** that no longer reflect current designs
- **Update naming conventions** as the project evolves
- **Consolidate similar screenshots** to avoid duplication
- **Back up important design iterations** for historical reference

## Development Best Practices

### Code Organization

- Follow the established project structure
- Keep components small and reusable
- Use TypeScript for type safety
- Implement proper error boundaries

### Performance Considerations

- Optimize images and assets
- Use Next.js built-in optimization features
- Implement proper caching strategies
- Monitor bundle size and performance metrics

### Security Guidelines

- Never commit sensitive data or credentials
- Use environment variables for configuration
- Implement proper authentication checks
- Follow OWASP security best practices

## Code Quality Standards

### Linting and Formatting

The project uses ESLint and Prettier for code quality:

```bash
# Check code quality
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Format code
npm run format
```

### TypeScript

- Use strict TypeScript configuration
- Define proper interfaces and types
- Avoid `any` types when possible
- Document complex type definitions

### Testing Requirements

- Write unit tests for utility functions
- Create component tests for UI components
- Implement integration tests for key user flows
- Maintain E2E tests for critical paths

## Testing Guidelines

### Running Tests

```bash
# Unit and integration tests
npm run test

# E2E tests
npm run test:e2e

# Test with coverage
npm run test:coverage
```

### Test Structure

- **Unit tests**: Located alongside source files (`*.test.ts`)
- **Component tests**: Use React Testing Library
- **E2E tests**: Use Playwright for full user flow testing
- **API tests**: Test API endpoints with proper mocking

### Best Practices

- Write tests before fixing bugs
- Test user interactions, not implementation details
- Use descriptive test names
- Keep tests focused and isolated
- Mock external dependencies appropriately

---

## Additional Resources

- [Project Architecture](./ARCHITECTURE.md)
- [Frontend Guide](./FRONTEND_GUIDE.md)
- [Backend Guide](./BACKEND_GUIDE.md)
- [API Reference](./API_REFERENCE.md)
- [Contributing Guidelines](./CONTRIBUTING.md)

For questions or clarifications, please refer to the project documentation or reach out to the development team.
