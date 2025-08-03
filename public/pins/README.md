# Map Pin Aesthetics

This directory contains the new minimalist pin designs for the food truck finder application.

## Available Pin Assets

### Basic Pins (48×48px)
- `pin-48-light.svg` - Simple circular pin for light mode
- `pin-48-dark.svg` - Simple circular pin for dark mode

### Basic Pins (64×64px)
- `pin-64-light.svg` - Simple circular pin for light mode (larger)
- `pin-64-dark.svg` - Simple circular pin for dark mode (larger)

### Food Truck Pins (48×48px)
- `food-truck-pin-48-light.svg` - Food truck icon pin for light mode
- `food-truck-pin-48-dark.svg` - Food truck icon pin for dark mode

### Food Truck Pins (64×64px)
- `food-truck-pin-64-light.svg` - Food truck icon pin for light mode (larger)
- `food-truck-pin-64-dark.svg` - Food truck icon pin for dark mode (larger)

## Usage Examples

### With Leaflet.js (React)

```tsx
import L from 'leaflet';
import { useTheme } from 'next-themes';

// Create themed food truck icon
const useFoodTruckIcon = (size: 48 | 64 = 48) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return new L.Icon({
    iconUrl: `/pins/food-truck-pin-${size}-${isDark ? 'dark' : 'light'}.svg`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
    className: `food-truck-pin map-pin-${size}`,
  });
};

// Usage in component
const TruckMarker = ({ truck, status }) => {
  const icon = useFoodTruckIcon(48);
  
  return (
    <Marker 
      position={[truck.lat, truck.lng]} 
      icon={icon}
      className={`${status === 'open' ? 'open' : 'closed'}`}
    >
      <Popup>{truck.name}</Popup>
    </Marker>
  );
};
```

### CSS Classes

The pins work with the CSS classes defined in `/styles/mapPins.css`:

```css
/* Size variants */
.map-pin-48 { width: 48px; height: 48px; }
.map-pin-64 { width: 64px; height: 64px; }

/* Status variants */
.food-truck-pin.open { /* Green glow for open trucks */ }
.food-truck-pin.closed { /* Red glow for closed trucks */ }
.food-truck-pin.featured { /* Amber glow with pulse animation */ }

/* Interactive states */
.food-truck-pin:hover { /* Scale and glow effects */ }
.map-pin-selected { /* Blue glow for selected pins */ }
```

## Design Features

- **Minimalist Design**: Clean, simple shapes that don't overwhelm the map
- **Subtle Inner Shadows**: Adds depth without being distracting
- **Theme-Aware**: Automatic light/dark mode variants using CSS variables
- **Scalable**: Available in 48×48 and 64×64 sizes
- **Performance Optimized**: Hardware-accelerated animations and transforms
- **Accessible**: Respects `prefers-reduced-motion` settings

## CSS Variables

All styling is centralized using CSS custom properties:

```css
:root {
  --pin-size-48: 48px;
  --pin-size-64: 64px;
  --pin-shadow-light: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15));
  --pin-shadow-dark: drop-shadow(0 2px 4px rgba(255, 255, 255, 0.1));
  --pin-glow-green: drop-shadow(0 0 4px rgba(34, 197, 94, 0.5));
  --pin-glow-red: drop-shadow(0 0 4px rgba(239, 68, 68, 0.5));
  --pin-glow-amber: drop-shadow(0 0 4px rgba(245, 158, 11, 0.5));
}
```

## Mobile Responsiveness

Pins automatically scale down on mobile devices:
- 48px pins become 40px on tablets, 36px on phones
- 64px pins become 52px on tablets, 48px on phones
- Hover effects are reduced on touch devices

## Browser Support

- Modern browsers with CSS custom properties support
- SVG filter effects for shadows and glows
- Hardware acceleration for smooth animations
