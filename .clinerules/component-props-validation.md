# Component Props Validation Guidelines

## Purpose
This document outlines the standards and procedures for validating props passed into UI components, particularly focusing on ensuring type safety and preventing `undefined`-related errors during component rendering.

## Validation Strategy
- **Explicit Prop Types**: Always define component prop types using explicit `interface` or `type` definitions rather than TypeScript's implicit `any` type. This enforces required properties and prevents missing prop errors.

- **Mandatory Props**: When components require specific props to function properly (e.g., TruckCard needing `price` and `image_url`), explicitly type these props and add validation logic where appropriate.

- **Fallback Mechanisms**: Use default prop values or graceful fallback behaviors when optional props might be `undefined`. For example, use default images or placeholder pricing information.

## Implementation Steps
1. **Component Interface**:
   - Define strict interfaces for all components that render conditional content based on passed props.

   ```typescript
   interface TruckCardContentProps {
     readonly truckName: string;
     readonly cuisineType: string;
     readonly averageRating: number;
     readonly totalReviews: number;
     readonly pricing: string; // e.g., '$', '$$', '$$$'
     readonly imageUrl: string | undefined;
     // Additional properties...
   }

   interface OperatingHours {
     dayOfWeek: 'Monday' | 'Tuesday' | ... | 'Sunday';
     isOpenToday: boolean;
     startTime: string; // e.g., '10:00 AM'
     endTime: string; // e.g., '8:00 PM'
   }

   interface TruckHoursDisplayProps {
     dailyHours: OperatingHours[];
     currentDate: string | Date; // ISO date string or Date object
     displayType: 'list' | 'grid';
   }
   ```

2. **Type Checks**:
   - Perform explicit type checks before JSX rendering
   ```typescript
   const TruckCardContent: React.FC<TruckCardContentProps> = ({ truckName, cuisineType, ...props }) => {
     if (!truckName || !cuisineType) {
       // Handle missing props with a fallback or error display
       return <div>Invalid Truck Information</div>;
     }

     const displayImage = props.imageUrl ?? DEFAULT_TRUCK_IMAGE;
     // Render with valid props
     return (
       <div>
         <h2>{truckName}</h2>
         <p>{cuisineType}</p>
         {displayImage && <img src={displayImage} alt={`${truckName} truck`} />}
         // Additional content here...
       </div>
     );
   };
   ```

3. **Error Handling**:
   - Implement prop validation utilities to check for missing properties
   - Add checks at component entry points (e.g., constructor) to validate passed props.

## Logging & Monitoring
- Log all prop validation errors to `ErrorBoundary` for real-time UI feedback.

## Related Rules
- **Component Deduplication**: Refer to `./component-deduplication.md` when managing consolidated props between similar components.
- **Type Safety**: Complement with `./type-safety.md` guidelines for handling external data.

## Conclusion
Enforcing strict prop validation across UI components ensures architectural integrity and reduces runtime errors. Proper type checking and default fallback strategies are essential for maintaining a high-quality codebase.

## Zero-Trust Validation Enforcement Rules

### Mandatory Linting Protocol

Every file modification must trigger this exact sequence:

1.  **Pre-Change Linting**: Run `npx eslint [specific-file]` and record the baseline.
2.  **Post-Change Linting**: Run `npx eslint [specific-file]` and compare to the baseline.
3.  **Associated Files Linting**: Run `npx eslint [directory]` to check broader impact.
4.  **Project-Wide Check**: Run `npx tsc --noEmit` to ensure no project-wide breakage.

### File Impact Analysis Requirements

For every file touched, identify and lint-check these categories:

**Direct Dependencies**:
- [ ] Files that import the changed file.
- [ ] Files that export to the changed file.
- [ ] Test files associated with the changed file.

**Indirect Dependencies**:
- [ ] Files that use types exported from the changed file.
- [ ] Files that extend interfaces from the changed file.
- [ ] Configuration files that reference the changed file.

**Runtime Dependencies**:
- [ ] Files that interact with the changed file at runtime.
- [ ] Files that share state with the changed file.
- [ ] Files that depend on the changed file's side effects.

### Repetitive Validation Cycle Enforcement

The AI developer must complete these validation cycles for EVERY task, without exception:

**Cycle 1: Syntax and Compilation**
- [ ] Verify file syntax is correct.
- [ ] Verify TypeScript compilation succeeds.
- [ ] Verify no new compilation errors were introduced.

**Cycle 2: Linting and Code Quality**
- [ ] Verify ESLint rules pass on modified files.
- [ ] Verify no new linting errors were introduced.
- [ ] Verify associated files maintain linting standards.

**Cycle 3: Functional Verification**
- [ ] Verify intended functionality works as expected.
- [ ] Verify no regressions in existing functionality.
- [ ] Verify error handling works correctly.

**Cycle 4: Integration Testing**
- [ ] Verify imports and exports work correctly.
- [ ] Verify no breaking changes to dependent files.
- [ ] Verify type compatibility across boundaries.

**Cycle 5: Performance and Side Effects**
- [ ] Verify no performance degradation.
- [ ] Verify no unintended side effects.
- [ ] Verify memory usage remains acceptable.

### Failure Response Protocol

When any validation cycle fails:

1.  **Immediate Stop**: Cease all forward progress.
2.  **Rollback**: Restore to the last known good state.
3.  **Document**: Record what failed and why.
4.  **Re-analyze**: Determine the root cause before retrying.
5.  **Modify Approach**: Adjust the strategy based on the failure analysis.