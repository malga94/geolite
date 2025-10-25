import { useEffect, useRef, useState } from "react";

interface StreetViewPanoramaProps {
  location: { lat: number; lng: number };
  apiKey: string;
}

const StreetViewPanorama = ({ location, apiKey }: StreetViewPanoramaProps) => {
  const panoramaRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (window.google) {
      setIsLoaded(true);
      return;
    }

    const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
    if (existingScript) {
      existingScript.addEventListener("load", () => setIsLoaded(true));
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsLoaded(true);
    script.onerror = () => console.error("Failed to load Google Maps API");
    document.head.appendChild(script);
  }, [apiKey]);

  useEffect(() => {
    if (!panoramaRef.current || !isLoaded || !window.google) return;

    const panorama = new window.google.maps.StreetViewPanorama(panoramaRef.current, {
      position: location,
      pov: { heading: 165, pitch: 0 },
      zoom: 1,
      addressControl: false,
      showRoadLabels: false,
      zoomControl: true,
      fullscreenControl: false,
      enableCloseButton: false,
    });
  }, [location, isLoaded]);

  return <div ref={panoramaRef} className="w-full h-full" />;
};

export default StreetViewPanorama;
