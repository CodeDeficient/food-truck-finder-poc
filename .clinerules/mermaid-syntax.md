## Brief overview

This rule set outlines guidelines for writing Mermaid diagrams to ensure they render correctly.

## Development workflow

- **Rule 1.1: Escape Special Characters in Mermaid Diagrams**: When creating Mermaid diagrams, ensure that any node text containing special characters (e.g., `(`, `)`, `[`, `]`, `{`, `}`) is enclosed in double quotes (`""`) to prevent parsing errors.
  - _Trigger Case_: When a Mermaid diagram fails to render due to a parsing error.
  - _Example_: Instead of `C[Frontend (Next.js)]`, use `C["Frontend (Next.js)"]`.
