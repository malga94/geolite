import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface DistancePageProps {
  level: number;
  guessLocation: { lat: number; lng: number };
  actualLocation: { lat: number; lng: number };
  apiKey: string;
}

// Haversine formula to calculate distance in kilometers between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

const Distance = ({ apiKey }: { apiKey: string }) => {
  const navigate = useNavigate();
  const location = useLocation();
  // state may come from Game via navigate('/distance', { state: { guessLocation, actualLocation, level, score, timeUp } })
  const state = location.state as {
    level: number;
    guessLocation?: { lat: number; lng: number };
    actualLocation?: { lat: number; lng: number };
    timeUp?: boolean;
    score?: number;
  } | null;
  const { level, guessLocation, actualLocation, score = 0 } = state || { level: 1 } as any;
  const mapRef = useRef<HTMLDivElement>(null);
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const guessMarkerRef = useRef<google.maps.Marker | null>(null);
  const actualMarkerRef = useRef<google.maps.Marker | null>(null);

let distance: number | null = null;

if (guessLocation && actualLocation) {
  // Calculate distance in km
  distance = calculateDistance(
    guessLocation.lat,
    guessLocation.lng,
    actualLocation.lat,
    actualLocation.lng
  );

  useEffect(() => {
    if (!mapRef.current || !window.google) return;

    // Calculate bounds to fit both points
    const bounds = new window.google.maps.LatLngBounds();
    bounds.extend(guessLocation);
    bounds.extend(actualLocation);

    // Initialize map
    const map = new window.google.maps.Map(mapRef.current, {
      zoom: 4,
      mapTypeId: "terrain",
      streetViewControl: false,
    });

    // Fit map to show both points
    map.fitBounds(bounds);

    // Create markers
    guessMarkerRef.current = new window.google.maps.Marker({
      position: guessLocation,
      map,
      title: "Your Guess",
      animation: window.google.maps.Animation.DROP,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: "#ef4444",
        fillOpacity: 0.8,
        strokeWeight: 2,
        strokeColor: "#ffffff"
      }
    });

    actualMarkerRef.current = new window.google.maps.Marker({
      position: actualLocation,
      map,
      title: "Actual Location",
      animation: window.google.maps.Animation.DROP,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: "#22c55e",
        fillOpacity: 0.8,
        strokeWeight: 2,
        strokeColor: "#ffffff"
      }
    });

    // Draw line between points
    polylineRef.current = new window.google.maps.Polyline({
      path: [guessLocation, actualLocation],
      geodesic: true,
      strokeColor: "#6366f1",
      strokeOpacity: 0.8,
      strokeWeight: 3,
    });

    polylineRef.current.setMap(map);

    return () => {
      if (guessMarkerRef.current) guessMarkerRef.current.setMap(null);
      if (actualMarkerRef.current) actualMarkerRef.current.setMap(null);
      if (polylineRef.current) polylineRef.current.setMap(null);
    };
    }, [guessLocation, actualLocation]);
}

  const handleNext = () => {
    if (level < 3) {
      navigate(`/game/${level + 1}`);
    } else {
      navigate("/score");
    }
  };
  if (!guessLocation || !actualLocation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-6">
          <p className="text-muted-foreground">Time's up! You score {score} points</p>
          <Button
            size="lg"
            onClick={handleNext}
            className="mt-6"
          >
            {level < 3 ? "Next Level" : "View Final Score"}
          </Button>
        </Card>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex flex-col items-center justify-center p-4 space-y-6">
      <Card className="w-full max-w-4xl p-6">
        <div className="flex flex-col items-center space-y-4">
          <h2 className="text-2xl font-bold mb-2">Round {level} Results</h2>
          <div className="space-y-2 text-center mb-4">
            <p className="text-lg">
              Distance: <span className="font-semibold">{Math.round(distance)} km</span>
            </p>
            <p className="text-lg">
              Points: <span className="font-semibold text-primary">{score}</span>
            </p>
          </div>
          
          {/* Map container */}
          <div 
            ref={mapRef}
            className="w-full h-[500px] rounded-lg overflow-hidden border-2 border-border"
          />

          <div className="flex items-center justify-center space-x-4 mt-4">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-2" />
              <span className="text-sm">Your Guess</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2" />
              <span className="text-sm">Actual Location</span>
            </div>
          </div>

          <Button
            size="lg"
            onClick={handleNext}
            className="mt-6"
          >
            {level < 3 ? "Next Level" : "View Final Score"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Distance;