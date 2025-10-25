import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Game from "./pages/Game";
import Score from "./pages/Score";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [scores, setScores] = useState<number[]>([]);
  const [apiKey, setApiKey] = useState(() => {
    return sessionStorage.getItem("googleMapsApiKey") || "";
  });

  const handleSetApiKey = (key: string) => {
    setApiKey(key);
    sessionStorage.setItem("googleMapsApiKey", key);
  };

  const resetGame = () => {
    setScores([]);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route
              path="/game/1"
              element={<Game level={1} scores={scores} setScores={setScores} apiKey={apiKey} setApiKey={handleSetApiKey} />}
            />
            <Route
              path="/game/2"
              element={<Game level={2} scores={scores} setScores={setScores} apiKey={apiKey} setApiKey={handleSetApiKey} />}
            />
            <Route
              path="/game/3"
              element={<Game level={3} scores={scores} setScores={setScores} apiKey={apiKey} setApiKey={handleSetApiKey} />}
            />
            <Route path="/score" element={<Score scores={scores} resetGame={resetGame} />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
