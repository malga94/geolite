import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin, Globe2, Target } from "lucide-react";
import heroImage from "@/assets/hero-globe.jpg";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                <Globe2 className="w-4 h-4" />
                Geography Challenge Game
              </div>
              <h1 className="text-6xl lg:text-7xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  GeoLite
                </span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Test your geography skills! Explore random locations around the world and guess where you are.
                The closer you get, the higher you score.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={() => navigate("/game/1")}
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
              >
                Start Game
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="font-semibold text-lg px-8 py-6"
              >
                How to Play
              </Button>
            </div>

            {/* Features */}
            <div className="grid sm:grid-cols-3 gap-4 pt-8">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold">3 Levels</div>
                  <div className="text-sm text-muted-foreground">Progressive challenge</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-secondary/10 p-2 rounded-lg">
                  <Target className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <div className="font-semibold">2 Minutes</div>
                  <div className="text-sm text-muted-foreground">Per level</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-accent/10 p-2 rounded-lg">
                  <Globe2 className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <div className="font-semibold">Global</div>
                  <div className="text-sm text-muted-foreground">Locations</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-3xl blur-3xl" />
            <img
              src={heroImage}
              alt="Globe showing various geographic locations"
              className="relative rounded-3xl shadow-2xl w-full h-auto object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
