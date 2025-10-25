import { useEffect, useRef } from "react";

interface StreetViewPanoramaProps {
  location: { lat: number; lng: number };
  apiKey: string;
}

const StreetViewPanorama = ({ location, apiKey }: StreetViewPanoramaProps) => {
  const panoramaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!panoramaRef.current || !window.google) return;

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
  }, [location]);

  useEffect(() => {
    if (window.google) return;

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [apiKey]);

  return <div ref={panoramaRef} className="w-full h-full" />;
};

export default StreetViewPanorama;
