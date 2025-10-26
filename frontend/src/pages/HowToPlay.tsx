import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Clock, Target, Award } from "lucide-react";

const HowToPlay = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                How to Play
              </span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Master the art of geographic guessing with these simple rules
            </p>
          </div>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Game Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>GeoLite is a geography guessing game where you explore random locations through Google Street View and try to pinpoint where you are on a world map.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-secondary" />
                  Game Structure
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <ul className="list-disc list-inside space-y-2">
                  <li>The game consists of <strong>3 levels</strong></li>
                  <li>Each level shows you a different location via Street View</li>
                  <li>You have <strong>2 minutes</strong> to make your guess for each level</li>
                  <li>Click anywhere on the mini-map to place your guess marker</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-accent" />
                  How to Play
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <ol className="list-decimal list-inside space-y-2">
                  <li>Look around the Street View to gather clues about your location</li>
                  <li>Use the mini-map to place your guess by clicking on it</li>
                  <li>Click the <strong>"Make Guess"</strong> button to submit your answer</li>
                  <li>See your score and move on to the next level</li>
                  <li>Complete all 3 levels to see your final score</li>
                </ol>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  Scoring
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>Your score is based on how close your guess is to the actual location:</p>
                <ul className="list-disc list-inside space-y-2 mt-2">
                  <li>The <strong>closer</strong> your guess, the <strong>higher</strong> your score</li>
                  <li>Maximum points per level: <strong>5000</strong></li>
                  <li>Distance is calculated in kilometers</li>
                  <li>Try to get as close as possible to maximize your total score!</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center pt-4">
            <Button
              size="lg"
              onClick={() => navigate("/")}
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-lg px-8 py-6"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowToPlay;
