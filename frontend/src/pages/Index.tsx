import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin, Globe2, Target, LogOut } from "lucide-react";
import heroImage from "@/assets/hero-globe.jpg";
import { GoogleLoginButton } from "@/components/GoogleLoginButton";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-8">
        {/* Top Right Auth Section */}
        <div className="flex justify-end items-start mb-8">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full border shadow-sm">
              {user.picture && (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border-2 border-primary/20"
                  referrerPolicy="no-referrer"
                />
              )}
              <span className="text-sm font-medium">{user.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="h-8 w-8 p-0 hover:bg-destructive/10"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-end gap-2">
              <p className="text-xs text-muted-foreground">
                Sign in to save your scores
              </p>
              <GoogleLoginButton />
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[70vh]">
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

            {/* Action Buttons */}
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
                  onClick={() => navigate("/how-to-play")}
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
