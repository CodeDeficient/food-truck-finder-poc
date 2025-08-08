# Coordinate Data Management Rules

## Objective
To establish consistent practices for managing coordinate data in Supabase to ensure unique, accurate truck locations on maps and prevent coordinate-related display issues.

## Core Principles

### 1. Coordinate Uniqueness and Accuracy
- **Rule 1.1:** All trucks in the `food_trucks` table must have unique, accurate coordinates when possible. Multiple trucks should not share the same coordinates unless they are legitimately at the same location.
- **Rule 1.2:** Default or fallback coordinates (e.g., Charleston center coordinates 32.7767, -79.9311) should only be temporary and must be replaced with accurate coordinates when addresses are available.
- **Rule 1.3:** Coordinate validation must be performed regularly to identify and fix trucks with duplicate, default, or inaccurate coordinates.

### 2. Coordinate Validation Process
- **Rule 2.1:** Before implementing coordinate fixes, always create a comprehensive audit to identify:
  - Trucks with default/fallback coordinates but valid addresses
  - Multiple trucks sharing identical coordinates
  - Coordinates that seem inconsistent with listed addresses
  - Missing coordinates entirely
- **Rule 2.2:** Use automated scripts with proper error handling and logging for bulk coordinate updates. Never perform manual coordinate updates at scale.
- **Rule 2.3:** All coordinate changes must be logged and reviewable. Implement rollback capabilities in case of errors.

### 3. Geocoding Best Practices
- **Rule 3.1:** Research and follow established best practices for geocoding applications before implementing coordinate fixes.
- **Rule 3.2:** Minimize API calls while maximizing accuracy by prioritizing trucks with the most obvious coordinate issues first.
- **Rule 3.3:** Handle edge cases appropriately (PO boxes, mobile trucks, etc.) and document the approach for each case type.

### 4. Ongoing Monitoring
- **Rule 4.1:** Integrate coordinate quality metrics into the data quality scoring system to automatically flag problematic entries.
- **Rule 4.2:** Display coordinate validation status and metrics in the admin dashboard for ongoing monitoring.
- **Rule 4.3:** Include coordinate accuracy as a factor in overall truck data quality scores.

## Verification Standards
- **Verification 1:** All trucks with valid addresses must display at correct, unique locations on the map.
- **Verification 2:** The admin dashboard must show coordinate quality metrics and flag entries needing attention.
- **Verification 3:** Coordinate validation scripts must run successfully with proper error handling and logging.
- **Verification 4:** Regular audits must confirm ongoing coordinate accuracy and uniqueness.

## Implementation Workflow
1. **Research Phase:** Study best practices for bulk coordinate validation
2. **Audit Phase:** Systematically identify all coordinate issues
3. **Script Development:** Create robust validation scripts with error handling
4. **Execution Phase:** Run validation starting with most obvious issues
5. **Monitoring Phase:** Implement ongoing quality checks and dashboard integration
