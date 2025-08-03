import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TruckMarkers from '../components/map/TruckMarkers';
import { pinStateHelpers } from '../components/map/TruckMarkers';
import React from 'react';

// Mock for react-leaflet, as it relies on browser APIs
jest.mock('react-leaflet', () => {
  const { forwardRef } = require('react');
  return {
    Marker: forwardRef(({ icon, children, ...props }, ref) => {
      return (
        <div data-testid="marker" className={icon?.options?.className || ''}>
          {children}
        </div>
      );
    }),
    Popup: ({ children }) => <div data-testid="popup">{children}</div>,
  };
});

const setup = (overrides = {}) => {
  const defaults = {
    trucks: [{
      id: '1',
      name: 'Truck 1',
      current_location: {
        lat: 50,
        lng: 0,
        address: '123 Main St',
      },
      is_open: true,
      is_selected: false,
    }],
    onSelectTruck: jest.fn(),
  };
  
  const props = { ...defaults, ...overrides };
  return render(<TruckMarkers {...props} />);
};

describe('TruckMarkers Component', () => {
  it('renders a marker for each valid truck', () => {
    setup();
    const markers = screen.getAllByText(/Truck 1/);
    expect(markers).toHaveLength(1);
  });

  it('applies the correct default class', () => {
    setup();
    const marker = screen.getByTestId('marker');
    expect(marker).toHaveClass('food-truck-marker-icon');
    expect(marker).toHaveClass('pin--default');
  });

  it('applies the active class when truck is open', () => {
    setup();
    const marker = screen.getByTestId('marker');
    expect(marker).toHaveClass('pin--active');
  });

  it('applies the selected class when truck is selected', () => {
    setup({ trucks: [{
      id: '1',
      name: 'Truck 1',
      current_location: {
        lat: 50,
        lng: 0,
        address: '123 Main St',
      },
      is_open: true,
      is_selected: true,
    }] });
    const marker = screen.getByTestId('marker');
    expect(marker).toHaveClass('pin--selected');
  });

  it('shows truck status in popup when available', () => {
    setup();
    const popup = screen.getByTestId('popup');
    expect(popup).toHaveTextContent('Open');
  });

  it('shows closed status for closed trucks', () => {
    setup({ trucks: [{
      id: '1',
      name: 'Truck 1',
      current_location: {
        lat: 50,
        lng: 0,
        address: '123 Main St',
      },
      is_open: false,
      is_selected: false,
    }] });
    const popup = screen.getByTestId('popup');
    expect(popup).toHaveTextContent('Closed');
  });

  it('filters out trucks without valid coordinates', () => {
    setup({ trucks: [
      {
        id: '1',
        name: 'Valid Truck',
        current_location: {
          lat: 50,
          lng: 0,
          address: '123 Main St',
        },
        is_open: true,
        is_selected: false,
      },
      {
        id: '2',
        name: 'Invalid Truck',
        current_location: {
          address: '456 Side St',
        },
        is_open: true,
        is_selected: false,
      }
    ] });
    
    const markers = screen.getAllByTestId('marker');
    expect(markers).toHaveLength(1);
    expect(screen.getByText('Valid Truck')).toBeInTheDocument();
    expect(screen.queryByText('Invalid Truck')).not.toBeInTheDocument();
  });

  it('toggles class on click using helpers', () => {
    document.body.innerHTML = '<div id="marker"></div>';
    const element = document.getElementById('marker');
    pinStateHelpers.toggleClass(element!, 'test-class');
    expect(element).toHaveClass('test-class');
    pinStateHelpers.toggleClass(element!, 'test-class');
    expect(element).not.toHaveClass('test-class');
  });
});

