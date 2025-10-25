import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface TimerProps {
  duration: number; // in seconds
  onTimeUp: () => void;
}

const Timer = ({ duration, onTimeUp }: TimerProps) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  console.log("Timer mounted for level");
  useEffect(() => {
    const interval = setInterval(() => {
    setTimeLeft(prev => {
      if (prev <= 1) {
        clearInterval(interval);
        onTimeUp(); // only called once
        return 0;
      }
      return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
    }, [onTimeUp]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isLowTime = timeLeft < 30;

  return (
    <div className={`flex items-center gap-2 font-mono text-lg font-bold ${isLowTime ? 'text-destructive' : 'text-foreground'}`}>
      <Clock className="w-5 h-5" />
      <span>
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </span>
    </div>
  );
};

export default Timer;
