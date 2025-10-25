import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import StreetViewPanorama from "@/components/StreetViewPanorama";
import MiniMap from "@/components/MiniMap";
import Timer from "@/components/Timer";
import { toast } from "sonner";

interface GameProps {
  level: number;
  scores: number[];
  setScores: (scores: number[]) => void;
  apiKey: string;
  setApiKey: (key: string) => void;
}

const Game = ({ level, scores, setScores, apiKey, setApiKey }: GameProps) => {
  const navigate = useNavigate();
  const [guessLocation, setGuessLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [actualLocation] = useState({ lat: 48.8584, lng: 2.2945 }); // Hardcoded: Eiffel Tower for now
  const [timeUp, setTimeUp] = useState(false);
  const [hasGuessed, setHasGuessed] = useState(false);

  const calculateScore = useCallback((guess: { lat: number; lng: number }, actual: { lat: number; lng: number }) => {
    // Placeholder score calculation - you'll implement the real one
    const distance = Math.sqrt(
      Math.pow(guess.lat - actual.lat, 2) + Math.pow(guess.lng - actual.lng, 2)
    );
    // Simple scoring: closer = higher score (max 5000 points)
    const score = Math.max(0, Math.floor(5000 - distance * 1000));
    return score;
  }, []);

  const handleGuess = useCallback(() => {
    if (!guessLocation) {
      toast.error("Please select a location on the map!");
      return;
    }

    const score = calculateScore(guessLocation, actualLocation);
    const newScores = [...scores, score];
    setScores(newScores);
    setHasGuessed(true);

    toast.success(`You scored ${score} points!`);

    setTimeout(() => {
      if (level < 3) {
        navigate(`/game/${level + 1}`);
      } else {
        navigate("/score");
      }
    }, 2000);
  }, [guessLocation, actualLocation, calculateScore, scores, setScores, level, navigate]);

  const handleTimeUp = useCallback(() => {
    if (hasGuessed) return;
    
    setTimeUp(true);
    const newScores = [...scores, 0];
    setScores(newScores);
    
    toast.error("Time's up! Moving to next level...");
    
    setTimeout(() => {
      if (level < 3) {
        navigate(`/game/${level + 1}`);
      } else {
        navigate("/score");
      }
    }, 2000);
  }, [scores, setScores, level, navigate, hasGuessed]);

  if (!apiKey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-6">
          <h2 className="text-2xl font-bold mb-4">Google Maps API Key Required</h2>
          <p className="text-muted-foreground mb-4">
            Please enter your Google Maps API key to play. You can get one from the{" "}
            <a
              href="https://developers.google.com/maps/documentation/javascript/get-api-key"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Google Cloud Console
            </a>
            .
          </p>
          <div className="space-y-4">
            <div>
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Enter your Google Maps API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
            <Button 
              onClick={() => {
                if (apiKey) {
                  navigate(0); // Reload the current route
                }
              }} 
              className="w-full"
              disabled={!apiKey}
            >
              Continue
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Street View Panorama */}
      <StreetViewPanorama location={actualLocation} apiKey={apiKey} />

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-card/90 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">GeoLite</h1>
            <span className="text-muted-foreground">Level {level}/3</span>
          </div>
          <Timer duration={300} onTimeUp={handleTimeUp} />
        </div>
      </div>

      {/* Mini Map & Guess Button */}
      <div className="absolute bottom-6 right-6 z-10 space-y-3">
        <Card className="p-2 shadow-lg">
          <MiniMap
            onLocationSelect={setGuessLocation}
            selectedLocation={guessLocation}
            apiKey={apiKey}
          />
        </Card>
        <Button
          size="lg"
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold"
          onClick={handleGuess}
          disabled={!guessLocation || timeUp || hasGuessed}
        >
          Make Guess
        </Button>
      </div>
    </div>
  );
};

export default Game;
