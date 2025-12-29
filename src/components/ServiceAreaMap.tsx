import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons in bundlers (Vite/CRA/etc)
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const ADDRESS = "21 Thorncraft Parade, Campsie NSW 2194, Australia";
const RADIUS_METERS = 50_000;

export default function ServiceAreaMap() {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Create map (temporary center; updated after geocode)
    const map = L.map(containerRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView([-33.91, 151.10], 12);

    mapRef.current = map;

    // OpenStreetMap tiles (NO Mapbox)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    const controller = new AbortController();

    async function geocodeAndDraw() {
      try {
        // Nominatim (OpenStreetMap) geocoding
        const url =
          "https://nominatim.openstreetmap.org/search?" +
          new URLSearchParams({
            format: "json",
            q: ADDRESS,
            limit: "1",
          }).toString();

        const res = await fetch(url, {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });

        if (!res.ok) throw new Error(`Geocoding failed: ${res.status}`);
        const data: Array<{ lat: string; lon: string; display_name: string }> =
          await res.json();

        if (!data.length) throw new Error("No geocoding results found.");

        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        const center: L.LatLngExpression = [lat, lon];

        // Marker (pointer/pin)
        const marker = L.marker(center).addTo(map);
        marker.bindPopup(`<b>Touch Cleaning HQ</b><br/>${ADDRESS}`).openPopup();

        // 50km service circle - yellow border + skyblue fill
        const circle = L.circle(center, {
          radius: RADIUS_METERS,
          color: "#FFD400",
          weight: 3,
          opacity: 0.95,
          fillColor: "#87CEEB",
          fillOpacity: 0.25,
        }).addTo(map);

        // Fit bounds to circle
        map.fitBounds(circle.getBounds(), { padding: [20, 20] });
      } catch (err) {
        console.error(err);
      }
    }

    geocodeAndDraw();

    return () => {
      controller.abort();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-[420px] rounded-xl overflow-hidden shadow-lg"
    />
  );
}
