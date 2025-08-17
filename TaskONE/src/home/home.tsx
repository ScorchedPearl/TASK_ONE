import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChefHat, Sparkles, Star } from "lucide-react";
import { VoiceControl } from "@/components/pearl/voiceControl";
import { ThemeToggle } from "@/components/pearl/themetoggle";
import { useNavigate } from "react-router-dom";
import { set } from "react-hook-form";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  
  const handleCommand = (command: string) => {
    setSearchQuery(command);

    if (command.includes("hello")) {
      alert("Hello! 👋");
    } else if (command.includes("dark mode")) {
      document.body.classList.toggle("dark");
    }
  };

  const handleTranscript = (transcript: string) => {
    console.log("Transcript:", transcript);
  };

  const handleError = (error: string) => {
    console.error("Voice error:", error);
  };

  const handleSignIn = () => {
    navigate('/auth');
  };

  const handleGetStarted = () => {
    navigate('/auth');
  };

  const handleExploreMenu = () => {
    navigate('/auth');
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 text-white">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff22_1px,transparent_1px),linear-gradient(to_bottom,#ffffff22_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
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


      <header className="fixed top-0 right-0 z-50 p-4">
        <div className="flex gap-3 items-center bg-slate-900/50 dark:bg-slate-950/50 backdrop-blur-xl border border-slate-700/50 rounded-lg px-4 py-2  transition-colors duration-200 hover:bg-slate-900/80 dark:hover:bg-slate-950/80">
          <VoiceControl
        onCommand={handleCommand}
        onTranscript={handleTranscript}
        onError={handleError}
        language="en-US"
        continuous={false}
        interimResults={true}
      />
          <ThemeToggle />
          <Button 
        variant="secondary"
        className="hover:bg-slate-800 text-white border-slate-700"
        onClick={handleSignIn}
          >
        Sign In
          </Button>
        </div>
      </header>

      <div className="z-10 text-center max-w-4xl mx-auto px-6 py-24">
        <div className="animate-fade-in-up">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-4 leading-tight">
            Elegant Coding
            <span className="block text-primary text-5xl md:text-7xl bg-gradient-to-r from-teal-500 to-teal-400 bg-clip-text text-transparent">
              Experience
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-300 dark:text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed">
            Master coding interviews with our curated question bank. 
            Organized by difficulty, enhanced with voice control, and designed for your success.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="hero-button bg-gradient-to-r from-teal-500 to-teal-600 text-primary-foreground font-bold px-8 py-4 text-lg flex items-center hover:scale-105 transform transition-all duration-300"
            >
              <ChefHat className="w-5 h-5 mr-2" />
              Start Your Journey
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={handleExploreMenu}
              className="border-primary/50 text-primary hover:bg-primary/10 px-8 py-4 text-lg hover:scale-105 transform transition-all duration-300"
            >
              Explore Questions
            </Button>
          </div>
        </div>

  
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">500+</div>
            <div className="text-sm text-slate-300 dark:text-slate-400">Curated Questions</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">3</div>
            <div className="text-sm text-slate-300 dark:text-slate-400">Difficulty Levels</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">∞</div>
            <div className="text-sm text-slate-300 dark:text-slate-400">Learning Possibilities</div>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="bg-slate-800/30 dark:bg-slate-900/30 rounded-lg p-6 border border-slate-700/50">
            <h3 className="text-xl font-semibold mb-2 text-primary">Voice Control</h3>
            <p className="text-slate-300 dark:text-slate-400 text-sm">Navigate and search using voice commands for a hands-free experience.</p>
          </div>
          <div className="bg-slate-800/30 dark:bg-slate-900/30 rounded-lg p-6 border border-slate-700/50">
            <h3 className="text-xl font-semibold mb-2 text-primary">Progress Tracking</h3>
            <p className="text-slate-300 dark:text-slate-400 text-sm">Track your completion progress and bookmark important questions.</p>
          </div>
        </div>
      </div>

      {searchQuery && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/90 dark:bg-slate-950/90 text-white px-6 py-3 rounded-lg shadow-lg border border-primary/40 animate-fade-in-up backdrop-blur-sm">
          <span className="font-semibold text-primary">Voice Command:</span> {searchQuery}
        </div>
      )}

      
    </div>
  );
}