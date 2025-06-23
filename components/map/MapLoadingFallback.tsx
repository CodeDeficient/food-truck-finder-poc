import React from 'react';

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
