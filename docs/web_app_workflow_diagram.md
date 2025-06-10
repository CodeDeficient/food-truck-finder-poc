# Web Application Workflow Diagram

```mermaid
graph TD
    A[User Accesses Web App] --> B{Authentication & Authorization}
    B --> C{Frontend (Next.js)}
    C --> D[Search & Filter Food Trucks]
    C --> E[View Food Truck Details]
    C --> F[View Events & Schedules]
    C --> G[Admin Dashboard Access]

    D --> H(API: /api/search)
    E --> I(API: /api/trucks/[id])
    F --> J(API: /api/events, /api/trucks/[id]/schedules)
    G --> K(API: /api/admin/*)

    H --> L[Supabase Database]
    I --> L
    J --> L
    K --> L

    L --> M[Data Pipeline]
    M --> L

    subgraph User Interactions
        D --> C
        E --> C
        F --> C
    end

    subgraph Admin Features
        G --> N[Manage Food Trucks]
        G --> O[Manage Events]
        G --> P[Monitor Data Quality]
        G --> Q[Configure Scraping]
        G --> R[View API Usage]
        N --> K
        O --> K
        P --> K
        Q --> K
        R --> K
    end

    style A fill:#f9f,stroke:#333,stroke-width:2px
    style B fill:#bbf,stroke:#333,stroke-width:2px
    style C fill:#bfb,stroke:#333,stroke-width:2px
    style D fill:#f9f,stroke:#333,stroke-width:2px
    style E fill:#f9f,stroke:#333,stroke-width:2px
    style F fill:#f9f,stroke:#333,stroke-width:2px
    style G fill:#f9f,stroke:#333,stroke-width:2px
    style H fill:#bbf,stroke:#333,stroke-width:2px
    style I fill:#bbf,stroke:#333,stroke-width:2px
    style J fill:#bbf,stroke:#333,stroke-width:2px
    style K fill:#bbf,stroke:#333,stroke-width:2px
    style L fill:#fbb,stroke:#333,stroke-width:2px
    style M fill:#bfb,stroke:#333,stroke-width:2px
    style N fill:#ccc,stroke:#333,stroke-width:2px
    style O fill:#ccc,stroke:#333,stroke-width:2px
    style P fill:#ccc,stroke:#333,stroke-width:2px
    style Q fill:#ccc,stroke:#333,stroke-width:2px
    style R fill:#ccc,stroke:#333,stroke-width:2px
```
