import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trophy, MapPin } from "lucide-react";

interface ScoreProps {
  scores: number[];
  resetGame: () => void;
}

const Score = ({ scores, resetGame }: ScoreProps) => {
  const navigate = useNavigate();
  const totalScore = scores.reduce((sum, score) => sum + score, 0);
  const maxScore = 15000; // 3 levels × 5000 max points
  const percentage = Math.round((totalScore / maxScore) * 100);

  const handlePlayAgain = () => {
    resetGame();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8 shadow-2xl">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="bg-accent/10 p-6 rounded-full">
              <Trophy className="w-16 h-16 text-accent" />
            </div>
          </div>

          <div>
            <h1 className="text-4xl font-bold mb-2">Game Complete!</h1>
            <p className="text-muted-foreground">Here's how you performed</p>
          </div>

          <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg p-6 space-y-4">
            <div className="text-center">
              <div className="text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {totalScore.toLocaleString()}
              </div>
              <p className="text-muted-foreground mt-2">Total Points</p>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
              {scores.map((score, index) => (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                    <MapPin className="w-4 h-4" />
                    Level {index + 1}
                  </div>
                  <div className="text-2xl font-bold">{score.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Accuracy</span>
              <span>{percentage}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-1000"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          <Button
            size="lg"
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold"
            onClick={handlePlayAgain}
          >
            Play Again
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Score;
