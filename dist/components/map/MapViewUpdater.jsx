import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
export function MapViewUpdater({ center, zoom }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, zoom !== null && zoom !== void 0 ? zoom : map.getZoom());
        }
    }, [center, zoom, map]);
    return <></>;
}
