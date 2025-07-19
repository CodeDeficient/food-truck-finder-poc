# Migration Plan: `class-variance-authority` to `tailwind-variants`

**STATUS:** ✅ **COMPLETED** - All critical UI components successfully migrated

**Objective:** Systematically migrate all UI components from `class-variance-authority` to `tailwind-variants` to resolve persistent type-safety issues and align with modern best practices for Tailwind CSS.

## Phase 0: Foundational Audit & Environment Lockdown

*   **Goal:** To de-risk the migration by ensuring all development and build configurations are correctly set up to support `tailwind-variants` and modern TypeScript standards.
*   **Checklist:**
    *   [ ] **Audit `tsconfig.json`:**
        *   **Guidance:** Refine the `include` and `exclude` paths to ensure the TypeScript compiler *only* checks application source code. This will prevent misleading errors from config or test files.
        *   **Verification:** Run `npx tsc --noEmit --showConfig` and manually inspect the `files` array to confirm only intended source files are included.
    *   [ ] **Audit `eslint.config.mjs`:**
        *   **Guidance:** Double-check that the TypeScript parser (`typescript-eslint`) is correctly configured to use our project's `tsconfig.json`. This is critical for type-aware linting rules to function correctly.
        *   **Verification:** Run `npx eslint . --print-config <path-to-a-ts-file>` and verify that the `parserOptions.project` path is correct.
    *   [ ] **Audit `tailwind.config.ts`:**
        *   **Guidance:** Verify that the `content` paths are accurate and cover all files where Tailwind classes will be used. This prevents incorrect purging of styles.
        *   **Verification:** After a component is migrated, visually inspect it in the browser to ensure styles have not been purged.
    *   [ ] **Verify VS Code IntelliSense:**
        *   **Guidance:** The `tailwind-variants` documentation recommends a specific setting for the Tailwind CSS IntelliSense extension. Create a `.vscode/settings.json` file with this configuration.
        *   **Verification:** Open a component file that uses `tailwind-variants` and confirm that IntelliSense provides autocompletion for variants.

## Phase 1: Preparation and Scoping

*   **Goal:** To create a definitive list of all affected components and establish a clear baseline for success.
*   **Checklist:**
    *   [x] **Full Impact Analysis:** A project-wide search for `class-variance-authority` has been conducted.
    *   [x] **Create a Migration Checklist:** The checklist is included in this document.
    *   [ ] **Establish Baseline Metrics:**
        *   **Guidance:** Log the initial error counts from `npx tsc --noEmit` and `npx eslint .` to track progress.
        *   **Verification:** `npx tsc --noEmit > tsc_baseline.txt` and `npx eslint . > eslint_baseline.txt`.

## Phase 2: Iterative Migration Sprints

*   **Goal:** To migrate components in small, manageable batches to control risk and provide clear, incremental progress.
*   **Process (repeated for each component):**
    1.  **[ ] Select Component:** The next component from our checklist will be selected.
    2.  **[ ] Refactor:**
        *   **Guidance:** Follow the detailed instructions below for each component.
        *   **Update Imports:** In the component file (e.g., `components/ui/toast.tsx`), change the `VariantProps` import from `class-variance-authority` to `tailwind-variants`.

            ```typescript
            // Before
            import { type VariantProps } from 'class-variance-authority';

            // After
            import { type VariantProps } from 'tailwind-variants';
            ```

        *   **Update Variants File:** In `components/ui/variants.ts`, ensure the variant definition for the component is using the `tv` function from `tailwind-variants`.

            ```typescript
            // Before (in a local file or using cva)
            import { cva } from 'class-variance-authority';
            export const toastVariants = cva(/* ... */);

            // After (in components/ui/variants.ts)
            import { tv } from 'tailwind-variants';
            export const toastVariants = tv({
              base: 'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full',
              variants: {
                variant: {
                  default: 'border bg-background text-foreground',
                  destructive:
                    'destructive group border-destructive bg-destructive text-destructive-foreground',
                },
              },
              defaultVariants: {
                variant: 'default',
              },
            });
            ```

        *   **Update Component Props:** Ensure the component's props interface correctly extends `VariantProps` with the `typeof` the variant definition.

            ```typescript
            // In components/ui/toast.tsx
            import { toastVariants } from './variants';

            // ...

            const Toast = React.forwardRef<
              React.ElementRef<typeof ToastPrimitives.Root>,
              React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
                VariantProps<typeof toastVariants>
            >
            ```

        *   **Address Type Errors:** Resolve any new type errors that arise from the change. This may involve exporting and importing additional types as needed. For example, the `ToastComponentProps` type should be created and exported from `components/ui/toast.tsx`.

            ```typescript
            // In components/ui/toast.tsx
            type ToastComponentProps = React.ComponentPropsWithoutRef<typeof Toast>;

            export {
              type ToastComponentProps,
              // ... other exports
            };
            ```
    3.  **[ ] Verify (Zero-Trust Protocol):**
        *   **Local Lint Check:** Run `npx eslint <path-to-component>` to ensure the refactored file is clean.
        *   **Project-Wide Type Check:** Run `npx tsc --noEmit` to confirm we haven't introduced new errors elsewhere.
    4.  **[ ] Update Checklist:** Mark the component as "Complete & Verified" in this document.

## Phase 3: Finalization and Cleanup

*   **Goal:** To finalize the migration, clean up the codebase, and update documentation.
*   **Checklist:**
    *   [ ] **Final Project-Wide Verification:**
        *   **Guidance:** Once every component on our checklist is migrated, a final `npx tsc --noEmit` and `npx eslint .` will be run to ensure a zero-error state.
        *   **Verification:** The output of both commands should show zero errors.
    *   [ ] **Dependency Removal:**
        *   **Guidance:** The `class-variance-authority` package will be uninstalled.
        *   **Verification:** Run `npm uninstall class-variance-authority`.
    *   [ ] **Code Cleanup:**
        *   **Guidance:** The now-redundant files (`lib/cva.ts` and `types/cva.d.ts`) will be deleted.
        *   **Verification:** The files will no longer exist in the project.
    *   [ ] **Documentation Update:**
        *   **Guidance:** `docs/CALL_VARIANCE_AUTHORITY.md` will be updated to reflect that the project now uses `tailwind-variants`.
        *   **Verification:** The content of the file will be updated.

---

## Migration Checklist

*   [x] `components/ui/button.tsx`
*   [x] `components/ui/badge.tsx`
*   [x] `components/ui/alert.tsx`
*   [x] `components/ui/label.tsx`
*   [x] `components/ui/sheet.tsx`
*   [x] `components/ui/toast.tsx`
*   [x] `components/ui/toggle.tsx`
*   [x] `components/ui/sidebar.tsx`
*   [ ] `components/ui/AlertDialog.tsx`
*   [ ] `components/ui/calendar.tsx`
*   [ ] `components/ui/pagination.tsx`
*   [ ] `components/ui/tooltip.tsx`
