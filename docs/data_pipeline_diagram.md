# Data Pipeline Diagram

```mermaid
graph TD
    A[Data Sources: Websites, APIs] --> B(Scraping Engine: Firecrawl, Custom Scrapers)
    B --> C{Data Ingestion & Initial Processing}
    C --> D[Raw Data Storage: Supabase (PostgreSQL)]
    D --> E(Data Transformation & Enrichment: Pipeline Processor)
    E --> F{Data Quality Checks & Validation}
    F --> G[Cleaned & Structured Data Storage: Supabase (PostgreSQL)]
    G --> H(API Endpoints: Search, Admin, Public)
    H --> I[Web Application: Next.js Frontend]
    I --> J[User Interface]

    subgraph Monitoring & Feedback
        K[Monitoring & Logging: Supabase Logs, Custom Metrics] --> E
        K --> F
        K --> H
        J --> L[User Feedback & Reporting]
        L --> A
    end

    subgraph Admin & Management
        M[Admin Dashboard] --> H
        M --> B
        M --> C
        M --> E
        M --> F
        M --> K
    end

    style A fill:#f9f,stroke:#333,stroke-width:2px
    style B fill:#bbf,stroke:#333,stroke-width:2px
    style C fill:#bfb,stroke:#333,stroke-width:2px
    style D fill:#fbb,stroke:#333,stroke-width:2px
    style E fill:#bbf,stroke:#333,stroke-width:2px
    style F fill:#bfb,stroke:#333,stroke-width:2px
    style G fill:#fbb,stroke:#333,stroke-width:2px
    style H fill:#f9f,stroke:#333,stroke-width:2px
    style I fill:#bbf,stroke:#333,stroke-width:2px
    style J fill:#bfb,stroke:#333,stroke-width:2px
    style K fill:#ccc,stroke:#333,stroke-width:2px
    style L fill:#ccc,stroke:#333,stroke-width:2px
    style M fill:#f9f,stroke:#333,stroke-width:2px
```
