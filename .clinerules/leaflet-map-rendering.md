## Brief overview
This rule set outlines guidelines for ensuring `react-leaflet` maps render correctly within a Next.js application, preventing common issues like the "Map container is already initialized" error and visibility problems.

## Development workflow
- **Rule 1.1: Dependency Alignment**: Ensure that the versions of `next`, `react`, `react-dom`, and their corresponding `@types` packages are compatible. Mismatches, especially between major versions (e.g., Next.js 15 with React 18), can cause subtle and difficult-to-diagnose type resolution errors.
  - _Trigger Case_: When encountering unexpected TypeScript errors related to core React hooks (`useState`, `useEffect`) or JSX types.
  - _Example_: If `next` is at version 14, ensure `react` and `react-dom` are at version 18. If `next` is at version 15, ensure `react` and `react-dom` are at version 19.

- **Rule 1.2: Use `leaflet-defaulticon-compatibility`**: To prevent issues with Leaflet's default marker icons not appearing, install and import the `leaflet-defaulticon-compatibility` package. This is a more robust solution than manual workarounds.
  - _Trigger Case_: When marker icons are not visible on the map.
  - _Example_:
    ```typescript
    import 'leaflet/dist/leaflet.css';
    import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
    import 'leaflet-defaulticon-compatibility';
    ```

- **Rule 1.3: Set Explicit Height on Map Container**: The `MapContainer` component from `react-leaflet` must have an explicit height set via its `style` prop. Percentage-based heights (e.g., `height: '100%'`) will not work unless the parent container has a defined height.
  - _Trigger Case_: The map does not appear on the page, and inspecting the DOM reveals that the `.leaflet-container` element has a height of `0px`.
  - _Example_:
    ```typescript
    <MapContainer
      style={{ height: '400px', width: '100%' }}
      ...
    />
    ```

- **Rule 1.4: Use `isMounted` State for Client-Side Rendering**: To prevent issues with React's Strict Mode and server-side rendering, use a state variable to ensure the `MapContainer` is only rendered on the client side after the component has mounted.
  - _Trigger Case_: The map fails to initialize correctly, or the "Map container is already initialized" error appears.
  - _Example_:
    ```typescript
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
      setIsMounted(true);
    }, []);

    if (!isMounted) {
      return <p>Loading map...</p>;
    }

    return <MapContainer ... />;
