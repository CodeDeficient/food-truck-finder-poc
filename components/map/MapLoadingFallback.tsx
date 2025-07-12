

/**
 * Displays a loading message centered in a container.
 * @example
 * MapLoadingFallback()
 * <div>Loading map...</div>
 * @returns {JSX.Element} A div element styled to show a loading message for the map.
 * @description
 *   - The container takes up the full size of its parent element.
 *   - Flexbox properties are used for centering the loading message both vertically and horizontally.
 *   - A light gray background color is set for the container to differentiate the loading state visually.
 */
export function MapLoadingFallback() {
  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f0f0',
      }}
    >
      <p>Loading map...</p>
    </div>
  );
}
