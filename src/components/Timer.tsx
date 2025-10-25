import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface TimerProps {
  duration: number; // in seconds
  onTimeUp: () => void;
}

const Timer = ({ duration, onTimeUp }: TimerProps) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, onTimeUp]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isLowTime = timeLeft < 60;

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
