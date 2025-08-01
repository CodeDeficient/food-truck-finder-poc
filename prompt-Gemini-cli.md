> **"Hey Gemini, we have a critical performance issue to resolve. Our latest Vercel deployment, while successful, is unnecessarily slow because it's fetching data from Supabase during the build process. Your role is a Senior Next.js Performance Engineer. Your mission is to refactor the data-fetching logic on our pages to be more efficient, and to clean up a minor configuration warning.**
>
> **Here is a summary of the Vercel build log findings that you must address:**
> `[15:25:42.825] Raw data from Supabase (getAllTrucks): [...]`
> `[15:25:42.825] Processing truck with ID: ...`
> `Your tsconfig.json extends another configuration... we recommend adding the Next.js plugin...`
>
> ---
>
> ### **Mission 1: Shift Data Fetching to the Client Side**
>
> **The Problem:** We are pre-rendering pages with live data, which slows down our build and wastes database resources. The goal is to make our pages load as static shells instantly, and then fetch data from the browser.
>
> **The Task:** I need you to write the refactored code for our page components to use client-side data fetching hooks.
>
> **Here is an example of what a current, problematic server-side fetching component might look like:**
>
> ```tsx
> // Example of the problematic code
> import { getAllTrucks } from '@/lib/supabase-server'; // A server-side function
>
> export default async function TrucksPage() {
>   const trucks = await getAllTrucks(); // Fetches data during the build
>
>   return (
>     <div>
>       {trucks.map(truck => (
>         <TruckCard key={truck.id} truck={truck} />
>       ))}
>     </div>
>   );
> }
> ```
>
> **Your refactored solution should follow this pattern:**
>
> **1.  **Add `'use client'`:** The component must be a client component.
> **2.  **Use `useEffect` and `useState`:** Fetch data after the component mounts.
> **3.  **Implement Loading and Error States:** Show a loading message while fetching and handle potential errors gracefully.
>
> **Please provide the complete, refactored TypeScript code for a `TrucksPage` component that implements this best-practice, client-side data fetching pattern.**
>
> ---
>
> ### **Mission 2: Fix the `tsconfig.json` Warning**
>
> **The Problem:** Vercel is warning us that our `tsconfig.json` file is missing the Next.js plugin, which can improve the developer experience.
>
> **The Task:** I need you to provide the exact, complete code for a corrected `tsconfig.json` file that includes the recommended Next.js plugin.
>
> **For context, here is a plausible *current* version of the file that is causing the warning:**
> ```json
> {
>   "extends": "@tsconfig/next/tsconfig.json",
>   "compilerOptions": {
>     "lib": ["dom", "dom.iterable", "esnext"],
>     "allowJs": true,
>     "skipLibCheck": true,
>     "strict": true,
>     "noEmit": true,
>     "esModuleInterop": true,
>     "module": "esnext",
>     "moduleResolution": "bundler",
>     "resolveJsonModule": true,
>     "isolatedModules": true,
>     "jsx": "preserve",
>     "incremental": true,
>     "paths": {
>       "@/*": ["./*"]
>     }
>   },
>   "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
>   "exclude": ["node_modules"]
> }
> ```
>
> **Your corrected version must add the `"plugins": [{ "name": "next" }]` field in the appropriate place within `compilerOptions`.**
>
> ---
>
> Please proceed with these two missions. Provide the complete, final code blocks for me to implement."
