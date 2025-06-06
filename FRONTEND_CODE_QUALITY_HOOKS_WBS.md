# Work Breakdown Structure: Lint-Staged and Husky Setup

This checklist breaks down the tasks for configuring `lint-staged` and Husky to enforce frontend code quality via pre-commit hooks.

## 1. Configure `lint-staged`

- **1.1 Read `package.json`**
  - 1.1.1 [ ] Use `read_file` to get the current content of `package.json`.
- **1.2 Add `lint-staged` Configuration to `package.json`**
  - 1.2.1 [ ] Define a `lint-staged` object in `package.json`.
  - 1.2.2 [ ] Add pattern for `*.{js,jsx,ts,tsx}` to run `eslint --fix`.
  - 1.2.3 [ ] Add pattern for `*.{js,jsx,ts,tsx,json,css,md}` to run `prettier --write`.
- **1.3 Write Updated `package.json`**
  - 1.3.1 [ ] Use `replace_in_file` or `write_to_file` to save changes to `package.json`.

## 2. Set up Husky Pre-Commit Hook

- **2.1 Initialize Husky (if not already initialized)**
  - 2.1.1 [ ] Check if `.husky/` directory exists.
  - 2.1.2 [ ] If not, attempt to execute `pnpm exec husky init`. (This should create `.husky/pre-commit` and update `package.json`'s `prepare` script).
  - 2.1.3 [ ] If `pnpm exec husky init` fails or if manual setup is preferred, guide user through `npm pkg set scripts.prepare="husky"` and creating `.husky/_/husky.sh` and `.husky/pre-commit` manually.
- **2.2 Configure Pre-Commit Hook Script (Husky v9/v10 compatibility)**
  - 2.2.1 [ ] Read the content of `.husky/pre-commit`.
  - 2.2.2 [ ] Based on Husky v9/v10 guidance, ensure the script in `.husky/pre-commit` _only_ contains the command to be executed, e.g., `pnpm exec lint-staged`. (The shebang and `husky.sh` sourcing lines are deprecated for v10).
  - 2.2.3 [ ] Write updated content to `.husky/pre-commit`.
- **2.3 Ensure Pre-Commit Hook is Executable**
  - 2.3.1 [ ] Inform user that `.husky/pre-commit` needs to be executable. If `husky init` worked, this is usually handled. Otherwise, user might need to run `git update-index --chmod=+x .husky/pre-commit` or `chmod +x .husky/pre-commit`.

## 3. Documentation (WBS 4.2.3)

- **3.1 Read `README.md`**
  - 3.1.1 [ ] Use `read_file` to get the current content of `README.md`.
- **3.2 Add Husky and `lint-staged` Documentation**
  - 3.2.1 [ ] Add a new section to `README.md` explaining:
    - What Husky and `lint-staged` are used for (pre-commit checks).
    - How they improve code quality.
    - That they run `eslint --fix` and `prettier --write` on staged files.
- **3.3 Write Updated `README.md`**
  - 3.3.1 [ ] Use `replace_in_file` to save changes to `README.md`.

## 4. Verification (Primarily Manual by User)

- **4.1 Guide User on Verification Steps**
  - 4.1.1 [ ] Instruct user to stage a file with intentional linting or formatting errors.
  - 4.1.2 [ ] Instruct user to attempt a `git commit`.
  - 4.1.3 [ ] Ask user to confirm if `lint-staged` ran, fixed the issues (if auto-fixable), and whether the commit proceeded or was blocked as expected.
