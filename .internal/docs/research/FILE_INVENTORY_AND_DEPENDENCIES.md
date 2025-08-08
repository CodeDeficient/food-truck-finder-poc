# Research Files Inventory & Dependency Mapping

## Executive Summary
This document provides a comprehensive inventory of all files in the `.internal/docs/research/` directory and maps their dependencies and cross-references throughout the codebase.

## Research Files Inventory

### 1. COMPETITOR_PROFIT_MODELS.md
- **Path**: `.internal/docs/research/COMPETITOR_PROFIT_MODELS.md`
- **Purpose**: Comprehensive analysis of business models and profit generation strategies in digital food truck platforms
- **Key Content**:
  - Market size and growth trends ($1.23B market in 2022, 6.4% CAGR)
  - StreetFoodFinder/BFT business model analysis
  - Comparative analysis of competitor pricing models
  - Revenue stream breakdowns (commissions, subscriptions, fees)
- **Size**: 188 lines, ~170 references/citations

### 2. DISRUPTIVE_FOOD_TRUCK_PRICING_MODEL.md
- **Path**: `.internal/docs/research/DISRUPTIVE_FOOD_TRUCK_PRICING_MODEL.md`
- **Purpose**: Design of TruckConnect's disruptive two-tiered pricing model
- **Key Content**:
  - Food truck business economics analysis
  - Competitive pricing landscape review
  - "Essential Launchpad" (Free Tier) specifications
  - "Growth Accelerator" (Premium Tier at $19.99/$24.99) specifications
- **Size**: 141 lines

### 3. FOOD_TRUCKS_IN_SOUTH_CAROLINA.md
- **Path**: `.internal/docs/research/FOOD_TRUCKS_IN_SOUTH_CAROLINA.md`
- **Purpose**: Quantitative analysis of South Carolina's food truck market
- **Key Content**:
  - ~2,894 registered food trucks in SC (SCDA data)
  - Regulatory landscape analysis (SCDA, DHEC, local permits)
  - Municipal data availability assessment
  - Data collection methodology framework
- **Size**: 145+ lines (truncated in view)

### 4. FOOD_TRUCK_APP_FEATURE_ANALYSIS.md
- **Path**: `.internal/docs/research/FOOD_TRUCK_APP_FEATURE_ANALYSIS.md`
- **Purpose**: Comprehensive feature analysis for food truck discovery platforms
- **Key Content**: (File truncated, but likely contains feature comparisons and requirements)
- **Size**: 175+ lines

## Cross-Reference Analysis

### Direct References Found

#### 1. Documentation Strategy References
- **DOCUMENTATION_STRATEGY.md**:
  - Line 19: References internal research location
  - Line 22: "Internal research"
  - Line 43-46: Explicitly recommends moving research files to internal:
    - PROFITABILITY_MODEL_RESEARCH (competitive advantage)
    - PROJECT_PLAN (internal strategy)

#### 2. Internal README
- **.internal/README.md**:
  - Line 9: "Research & Analysis" section mentions profitability models and technical research
  - Establishes the purpose of internal documentation

#### 3. Public Documentation References
- **docs/README.md**:
  - Line 56: References COCOMO_ANALYSIS.md (related to profitability research)
  
- **README.md** (main):
  - Line 188: Links to COCOMO III Project Analysis

### Indirect References & Dependencies

#### 1. Code Files with Research Keywords
Multiple code files contain references that may relate to research data:

- **lib/autoScraper.ts**: Lines 94, 552 - Contains internal references
- **lib/discoveryEngine.ts**: Line 327 - Internal discovery references
- **lib/gemini/usageLimits.ts**: Lines 76, 79 - Internal usage tracking

#### 2. Archive References
- **.internal/docs/archive/PROJECT_PLAN_ORIGINAL.md**:
  - Line 24: References profitability models
  - Line 1915: Contains internal research references

#### 3. Related Internal Documentation
Files that may reference or depend on research:
- `.internal/docs/PROFITABILITY_MODEL_RESEARCH_1.md`
- `.internal/docs/STRATEGIC_LAUNCH_PLAN_REVISED.md`
- `.internal/docs/LICENSE_IP_RESEARCH.md`
- `.internal/docs/SOTA_DATA_PIPELINE_RESEARCH.md`

## Files Requiring Updates for Cross-References

### High Priority Updates
1. **DOCUMENTATION_STRATEGY.md**
   - Already references research files as needing to be internal
   - May need path updates if files are moved

2. **Main README.md**
   - Currently references COCOMO analysis
   - Should verify all research links are properly directed to internal paths

3. **.internal/README.md**
   - Central index for internal docs
   - Should maintain accurate inventory of research files

### Medium Priority Updates
1. **docs/README.md**
   - Public documentation hub
   - Should remove any direct links to internal research

2. **Archive Files**
   - Historical references may need notes about file relocations

### Low Priority (Monitoring Only)
1. **Code Files**
   - TypeScript/JavaScript files with "internal" references
   - Generally don't directly link to markdown docs
   - Monitor for any hardcoded paths

## Dependency Risk Assessment

### Critical Dependencies
- **None identified**: Research files appear to be reference documents rather than active dependencies

### Documentation Dependencies
- **Cross-linking**: Several docs reference research for context
- **Migration risk**: Low - mostly informational references

### Code Dependencies
- **None identified**: No code directly imports or requires these research files

## Recommendations

### 1. File Organization
- ✅ Research files are already properly located in `.internal/docs/research/`
- ✅ Clear separation between public and internal documentation

### 2. Reference Updates Needed
- Update DOCUMENTATION_STRATEGY.md to reflect current locations
- Ensure public docs don't expose internal research paths
- Add research inventory to .internal/README.md

### 3. Access Control
- Verify `.internal` directory is properly gitignored for sensitive content
- Consider adding a research index file for easier navigation

### 4. Documentation Standards
- Add consistent headers to all research files
- Include creation/update dates
- Add author attribution where appropriate

## Migration Checklist

- [x] Inventory all research files
- [x] Map file dependencies
- [x] Identify cross-references
- [ ] Update documentation strategy
- [ ] Update internal README index
- [ ] Verify public/private separation
- [ ] Add research navigation index
- [ ] Document access protocols

## Summary

The research files in `.internal/docs/research/` contain valuable competitive analysis and strategic planning information. They are:

1. **Properly Located**: Already in the internal directory structure
2. **Well Organized**: Clear naming and purpose
3. **Minimally Referenced**: Few direct dependencies in the codebase
4. **Low Risk**: Changes would have minimal impact on functionality

The main action items are documentation updates to ensure proper cross-referencing and maintaining clear separation between public and internal content.

---

*Last Updated: [Current Date]*
*Status: Complete*
*Next Review: After documentation strategy implementation*
