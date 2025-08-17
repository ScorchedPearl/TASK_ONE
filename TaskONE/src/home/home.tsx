import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChefHat, Sparkles, Star } from "lucide-react";
import { VoiceControl } from "@/components/pearl/voiceControl";
import { ThemeToggle } from "@/components/pearl/themetoggle";
import { useNavigate } from "react-router-dom";
export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const handleVoiceCommand = useCallback((cmd: any) => {
    const command = cmd.toLowerCase();
    setSearchQuery(command);
  }, []);
  const navigate = useNavigate();
  const handleSignIn = () => {
    navigate('/auth');
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-slate-900 to-slate-800 text-white">

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      </div>

      <div className="absolute top-20 left-20 opacity-80">
        <ChefHat className="w-10 h-10 text-primary/30" />
      </div>
      <div className="absolute top-40 right-32 opacity-70">
        <Sparkles className="w-8 h-8 text-primary/30" />
      </div>
      <div className="absolute bottom-32 left-32 opacity-60">
        <Star className="w-12 h-12 text-primary/20" />
      </div>

      <div className="fixed top-4 right-4 z-50 flex gap-3 items-center">
        <VoiceControl onCommand={handleVoiceCommand} />
        <ThemeToggle />
        <Button variant="secondary" className="bg-blue-950" onClick={handleSignIn}>
          Sign In
        </Button>
      </div>

      <div className="z-10 text-center max-w-4xl mx-auto px-6 py-24">
        <div className="animate-fade-in-up">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-4 leading-tight">
            Elegant Dining
            <span className="block text-primary text-5xl md:text-7xl">Experience</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Serve knowledge from your kitchen. Discover questions crafted with care,
            organized by difficulty, and presented with culinary elegance.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="hero-button bg-gradient-to-r from-primary to-teal-400 text-primary-foreground font-bold px-8 py-4 text-lg flex items-center"
            >
              <ChefHat className="w-5 h-5 mr-2" />
              Start Your Experience
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="border-primary/50 text-primary hover:bg-primary/10 px-8 py-4 text-lg"
            >
              Explore Menu
            </Button>
          </div>
        </div>
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">50+</div>
            <div className="text-sm text-slate-300">Curated Questions</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">3</div>
            <div className="text-sm text-slate-300">Difficulty Levels</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">∞</div>
            <div className="text-sm text-slate-300">Learning Possibilities</div>
          </div>
        </div>
      </div>

      {searchQuery && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/90 text-white px-6 py-3 rounded-lg shadow-lg border border-primary/40 animate-fade-in-up">
          <span className="font-semibold text-primary">Search:</span> {searchQuery}
        </div>
      )}
    </div>
  );
}
