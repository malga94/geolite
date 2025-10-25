import { useEffect, useRef, useState } from "react";

interface MiniMapProps {
  onLocationSelect: (location: { lat: number; lng: number }) => void;
  selectedLocation: { lat: number; lng: number } | null;
  apiKey: string;
}

const MiniMap = ({ onLocationSelect, selectedLocation, apiKey }: MiniMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(!!window.google);

  useEffect(() => {
    if (window.google) {
      setIsLoaded(true);
      return;
    }

    const checkGoogleMaps = setInterval(() => {
      if (window.google) {
        setIsLoaded(true);
        clearInterval(checkGoogleMaps);
      }
    }, 100);

    return () => clearInterval(checkGoogleMaps);
  }, []);

  useEffect(() => {
    if (!mapRef.current || !isLoaded || !window.google || mapInstanceRef.current) return;

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
  }, [onLocationSelect, isLoaded]);

  useEffect(() => {
    if (!mapInstanceRef.current || !selectedLocation) return;

    if (markerRef.current) {
      markerRef.current.setPosition(selectedLocation);
    }
  }, [selectedLocation]);

  return <div ref={mapRef} className="w-80 h-64 rounded-lg" />;
};

export default MiniMap;
