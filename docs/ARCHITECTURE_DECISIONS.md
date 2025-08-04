# Architectural Decision Record (ADR)

This document records significant architectural decisions made during the development of the Food Truck Finder application, particularly where the implementation deviates from initial plans.

---

## ADR-001: Authentication System

**Date:** 2025-07-24

**Context:** The initial plan outlined in `docs/AUTH_ARCHITECTURE.md` proposed a decoupled system using Firebase for identity and Supabase for the backend. The `STRATEGIC_LAUNCH_PLAN_REVISED.md` proposed a simpler password protection for the beta.

**Decision:** We implemented a Supabase-native Role-Based Access Control (RBAC) system. This approach was chosen because it is more integrated, leverages Supabase's built-in capabilities, and provides robust security without the added complexity of managing two separate user systems (Firebase and Supabase). This implementation is more secure than the simple password plan and more streamlined than the Firebase plan.

---

## ADR-002: Data Pipeline Classification

**Date:** 2025-07-24

**Context:** The initial plan in `docs/DATA_PIPELINE_ARCHITECTURE.md` detailed a multi-tiered system for pre-classifying scraped entities (truck, event, directory).

**Decision:** For the initial implementation, we have focused on an "extract-then-validate" pipeline. This model uses the success or failure of the Gemini AI extraction step as an implicit classification gate. This proved to be a more direct and effective method for the initial launch, ensuring only valid food truck data is processed while deferring the complexity of a pre-classification system.