import { useEffect, useRef } from "react";

interface MiniMapProps {
  onLocationSelect: (location: { lat: number; lng: number }) => void;
  selectedLocation: { lat: number; lng: number } | null;
  apiKey: string;
}

const MiniMap = ({ onLocationSelect, selectedLocation, apiKey }: MiniMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || !window.google || mapInstanceRef.current) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 20, lng: 0 },
      zoom: 2,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    mapInstanceRef.current = map;

    map.addListener("click", (e: any) => {
      if (e.latLng) {
        const location = {
          lat: e.latLng.lat(),
          lng: e.latLng.lng(),
        };
        onLocationSelect(location);

        if (markerRef.current) {
          markerRef.current.setMap(null);
        }

        markerRef.current = new window.google.maps.Marker({
          position: location,
          map: map,
          animation: window.google.maps.Animation.DROP,
        });
      }
    });
  }, [onLocationSelect]);

  useEffect(() => {
    if (!mapInstanceRef.current || !selectedLocation) return;

    if (markerRef.current) {
      markerRef.current.setPosition(selectedLocation);
    }
  }, [selectedLocation]);

  return <div ref={mapRef} className="w-80 h-64 rounded-lg" />;
};

export default MiniMap;
