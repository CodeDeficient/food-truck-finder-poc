# Mockups Directory

This directory contains screenshots and mockups used for design communication and development planning. The structure is organized to support efficient design workflows and clear communication between team members.

## Directory Structure

```
mockups/
├── components/        # Individual component mockups
│   ├── truck-card/   # Example: Food truck card component
│   ├── search-filters/
│   └── navigation/
├── pages/            # Full page layouts and designs
│   ├── home/
│   ├── search/
│   └── admin/
├── user-flows/       # Multi-step user journey mockups
│   ├── onboarding/
│   ├── search-to-details/
│   └── admin-workflow/
└── iterations/       # Design iteration history
    ├── v1-initial/
    ├── v2-responsive/
    └── v3-accessibility/
```

## Usage Guidelines

### File Naming Convention

Use descriptive filenames that include:
- Component/page name
- State or variant
- Date (YYYY-MM-DD format)
- Resolution if multiple sizes

Examples:
- `truck-card-mockup-hover-state-2025-01-15-desktop.png`
- `search-filters-expanded-2025-01-15-mobile.png`
- `admin-dashboard-loading-state-2025-01-15.png`

### Best Practices

1. **Consistent Resolution**: Use 1920x1080 for desktop mockups
2. **Standard Viewports**: 
   - Desktop: 1920x1080
   - Tablet: 768x1024
   - Mobile: 375x667 or 390x844
3. **Clean Screenshots**: No browser toolbars or bookmarks visible
4. **Realistic Content**: Use actual content when possible
5. **Annotations**: Use tools like Figma or simple image editors to annotate interactive elements

### Integration with Development

Screenshots in this directory should be:
- Referenced in component documentation
- Used for visual regression testing
- Linked in pull requests for design reviews
- Updated when designs change significantly

For detailed guidelines on using screenshots for mockups, see the [Developer Guide](../DEVELOPER_GUIDE.md#using-screenshots-for-mock-ups).

## Tools

Recommended tools for creating and managing mockups:
- **macOS**: CleanShot X, built-in screenshot tools
- **Windows**: Snipping Tool, ShareX, Greenshot
- **Cross-platform**: Figma, browser extensions
- **Animation**: Kap (macOS), ScreenToGif (Windows)

## Version Control

- Use Git LFS for large image files if needed
- Group related mockups in single commits
- Archive old iterations in the `iterations/` directory
- Document changes in commit messages
