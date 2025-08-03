# Error Handling UX Guidelines

## Error State Wireframes

### Data Missing
![Data Missing Fallback](images/data-missing-fallback.png)

### Network Error
![Network Error Fallback](images/network-error-fallback.png)

### Unknown Error
![Unknown Error Fallback](images/unknown-error-fallback.png)

## Copy Tone
- **Empathetic**: Messages should be supportive and provide clear guidance on the next steps.
- **Concise**: Keep the error messages short to convey only essential information.

Example:
- "We encountered an error. Please try again."

## Colors
Utilize Tailwind's semantic tokens:
- **Background**: `bg-destructive/5`
- **Foreground**: `text-destructive`
- **Borders**: `border-destructive/20`

## Accessibility Notes
- **ARIA Live Regions**: Use `aria-live="polite"` to announce updates.
- Ensure buttons have `aria-label` for clear navigation.

## Fallback Components
- **`DataMissingFallback`**: Handles scenarios with no data.
- **`NetworkErrorFallback`**: Displays when there are connectivity issues.
- **`UnknownErrorFallback`**: Catches unexpected errors.

### Skeleton Loading
- **`TruckCardSkeleton`** and **`TruckListSkeleton`**: To provide a visual waiting state while data is fetched.

