import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Head office coordinates: 21 Thorncraft Parade, Campsie NSW 2194
const HEAD_OFFICE = {
  lng: 151.1029,
  lat: -33.9118,
  address: "21 Thorncraft Parade, Campsie NSW 2194"
};

const RADIUS_KM = 50;

interface ServiceAreaMapProps {
  accessToken?: string;
}

const ServiceAreaMap = ({ accessToken }: ServiceAreaMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [token, setToken] = useState(accessToken || '');
  const [showTokenInput, setShowTokenInput] = useState(!accessToken);

  useEffect(() => {
    if (!mapContainer.current || !token) return;

    mapboxgl.accessToken = token;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [HEAD_OFFICE.lng, HEAD_OFFICE.lat],
        zoom: 9,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Add marker for head office
      const marker = new mapboxgl.Marker({ color: '#0ea5e9' })
        .setLngLat([HEAD_OFFICE.lng, HEAD_OFFICE.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<div style="padding: 8px;"><strong>Touch Cleaning HQ</strong><br/>${HEAD_OFFICE.address}</div>`
          )
        )
        .addTo(map.current);

      // Add 50km radius circle
      map.current.on('load', () => {
        if (!map.current) return;

        // Create a circle using turf-like calculation
        const radiusInDegrees = RADIUS_KM / 111.32; // approximate degrees per km at this latitude
        const circle = createGeoJSONCircle([HEAD_OFFICE.lng, HEAD_OFFICE.lat], RADIUS_KM);

        map.current.addSource('service-area', {
          type: 'geojson',
          data: circle
        });

        map.current.addLayer({
          id: 'service-area-fill',
          type: 'fill',
          source: 'service-area',
          paint: {
            'fill-color': '#0ea5e9',
            'fill-opacity': 0.15
          }
        });

        map.current.addLayer({
          id: 'service-area-outline',
          type: 'line',
          source: 'service-area',
          paint: {
            'line-color': '#0ea5e9',
            'line-width': 2,
            'line-dasharray': [2, 2]
          }
        });
      });

      setShowTokenInput(false);
    } catch (error) {
      console.error('Map initialization error:', error);
      setShowTokenInput(true);
    }

    return () => {
      map.current?.remove();
    };
  }, [token]);

  // Create a GeoJSON circle
  function createGeoJSONCircle(center: [number, number], radiusKm: number, points = 64) {
    const coords: [number, number][] = [];
    const km = radiusKm;
    
    for (let i = 0; i < points; i++) {
      const angle = (i / points) * 2 * Math.PI;
      const dx = km * Math.cos(angle);
      const dy = km * Math.sin(angle);
      
      // Convert km to degrees (approximate)
      const lat = center[1] + (dy / 111.32);
      const lng = center[0] + (dx / (111.32 * Math.cos(center[1] * Math.PI / 180)));
      
      coords.push([lng, lat]);
    }
    coords.push(coords[0]); // Close the circle

    return {
      type: 'Feature' as const,
      geometry: {
        type: 'Polygon' as const,
        coordinates: [coords]
      },
      properties: {}
    };
  }

  if (showTokenInput) {
    return (
      <div className="w-full h-[400px] bg-muted rounded-xl flex flex-col items-center justify-center p-8">
        <p className="text-muted-foreground text-center mb-4">
          To display the service area map, please enter your Mapbox public token.
          <br />
          <a 
            href="https://mapbox.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            Get your token from Mapbox
          </a>
        </p>
        <div className="flex gap-2 w-full max-w-md">
          <input
            type="text"
            placeholder="Enter Mapbox public token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg border border-border bg-background text-foreground"
          />
          <button
            onClick={() => setShowTokenInput(false)}
            disabled={!token}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50"
          >
            Load Map
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[400px] rounded-xl overflow-hidden shadow-lg">
      <div ref={mapContainer} className="absolute inset-0" />
      <div className="absolute bottom-4 left-4 bg-background/95 backdrop-blur px-4 py-2 rounded-lg shadow-md">
        <p className="text-sm font-medium text-foreground">Service Area: 50km radius</p>
        <p className="text-xs text-muted-foreground">From Campsie, NSW</p>
      </div>
    </div>
  );
};

export default ServiceAreaMap;
