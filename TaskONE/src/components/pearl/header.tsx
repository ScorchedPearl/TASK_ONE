import { Mic, MicOff, Sun, Moon, LogOut, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  currentUser: any;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedDifficulty: string;
  setSelectedDifficulty: (difficulty: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  categories: any[];
  darkMode: boolean;
  setDarkMode: (mode: boolean) => void;
  isListening: boolean;
  toggleVoiceRecognition: () => void;
  speechRecognition: any;
  logout: () => void;
}

export const Header = ({
  currentUser,
  searchTerm,
  setSearchTerm,
  selectedDifficulty,
  setSelectedDifficulty,
  selectedCategory,
  setSelectedCategory,
  categories,
  darkMode,
  setDarkMode,
  isListening,
  toggleVoiceRecognition,
  speechRecognition,
  logout
}: HeaderProps) => {
  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold glow-text">
              GeekHeaven
            </h1>
            <span className="text-sm text-muted-foreground">
              Welcome, {currentUser?.name}
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            {speechRecognition && (
              <Button
                variant="outline"
                size="icon"
                onClick={toggleVoiceRecognition}
                className={`voice-button ${isListening ? 'listening' : ''}`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
            )}
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => setDarkMode(!darkMode)}
              className="theme-toggle"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            
            <Button
              variant="ghost"
              onClick={logout}
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="border-t border-border bg-secondary/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative search-container">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
              <input
                type="text"
                placeholder="Search questions... (or use voice command)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent search-input transition-all duration-300"
              />
            </div>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-4 py-3 border border-border rounded-lg bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-300"
            >
              <option value="">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-border rounded-lg bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-300"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.title}
                </option>
              ))}
            </select>
          </div>
          
          {speechRecognition && (
            <div className="mt-3 text-sm text-muted-foreground">
              💡 Try voice commands: "Open Arrays", "Show easy questions", "Search for sorting", "Toggle theme"
            </div>
          )}
        </div>
      </div>
    </header>
  );
};