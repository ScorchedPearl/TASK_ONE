import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Moon, Sun, Mic, MicOff, ChevronDown, ChevronRight, Play, ExternalLink, BookOpen, CheckCircle, Bookmark, BookmarkCheck, BarChart3, Trophy, Target } from 'lucide-react';
import { useUser } from '@/providers/userprovider';
import Loader from '@/loading';
import { useNavigate } from 'react-router-dom';
import type { User } from '@/types/auth_interface';
import { Listbox } from '@headlessui/react';
import { ChevronUpDownIcon } from "@heroicons/react/24/outline";
import { ThemeToggle } from '@/components/pearl/themetoggle';
import { VoiceControl } from '@/components/pearl/voiceControl';


const Avatar = ({ user }: { user: User }) => {
  const avatarUrl = user.profileImage;
  return (
    <div className="flex items-center space-x-3">
      <div className="relative">
        {avatarUrl && (
          <img 
            src={avatarUrl} 
            alt={user.name}
            className="w-10 h-10 rounded-full border-2 border-cyan-500/30 object-cover"
          />
        )}
      </div>
    </div>
  );
};

interface Category {
  id: string;
  title: string;
  slNo: number;
  questionCount: number;
}

interface Question {
  id: string;
  questionId: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  ytLink?: string;
  p1Link?: string;
  p2Link?: string;
  category: {
    id: string;
    title: string;
    slNo: number;
  };
  isCompleted: boolean;
  isBookmarked: boolean;
}

interface ContentData {
  questions: Question[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface ProgressStats {
  totalQuestions: number;
  completedQuestions: number;
  completionPercentage: number;
}

interface BookmarkData {
  bookmarks: any[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

const FlowPage: React.FC = () => {
  const { currentUser, logout } = useUser();
  const navigate = useNavigate();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [progressStats, setProgressStats] = useState<ProgressStats>({
    totalQuestions: 0,
    completedQuestions: 0,
    completionPercentage: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['1', '2']));
  const [activeTab, setActiveTab] = useState<'questions' | 'bookmarks' | 'progress'>('questions');
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [isListening, setIsListening] = useState(false);
  const [speechRecognition, setSpeechRecognition] = useState<any>(null);
  
  const searchTimeoutRef = useRef<NodeJS.Timeout>(null);
  const recognitionRef = useRef<any>(null);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

  useEffect(() => {
    if (!currentUser) {
      navigate('/auth');
    }
  }, [currentUser]);
const difficulties = ["All Difficulties", "Easy", "Medium", "Hard"];
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('__Pearl_Token');
      const response = await fetch(`${BACKEND_URL}/api/content/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setCategories(data.data.categories);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchQuestions = async (search = '', difficulty = '', category = '') => {
    try {
      const token = localStorage.getItem('__Pearl_Token');
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (difficulty) params.append('difficulty', difficulty);
      if (category) params.append('category', category);
      params.append('limit', '100');
      
      const response = await fetch(`${BACKEND_URL}/api/content?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data: { data: ContentData } = await response.json();
        setQuestions(data.data.questions);
      } 
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    }
  };

  const fetchBookmarks = async () => {
    try {
      const token = localStorage.getItem('__Pearl_Token');
      const response = await fetch(`${BACKEND_URL}/api/content/user/bookmarks?limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data: { data: BookmarkData } = await response.json();
        setBookmarks(data.data.bookmarks);
      }
    } catch (error) {
      console.error('Failed to fetch bookmarks:', error);
    }
  };

  const fetchProgressStats = async () => {
    try {
      const token = localStorage.getItem('__Pearl_Token');
      const response = await fetch(`${BACKEND_URL}/api/content/user/progress`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setProgressStats(data.data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch progress stats:', error);
    }
  };

  const toggleBookmark = async (questionId: string) => {
    try {
      const token = localStorage.getItem('__Pearl_Token');
      const question = questions.find(q => q.id === questionId);
      
      if (question?.isBookmarked) {
        const response = await fetch(`${BACKEND_URL}/api/content/user/bookmarks/${questionId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          setQuestions(prev => prev.map(q => 
            q.id === questionId ? { ...q, isBookmarked: false } : q
          ));
          fetchBookmarks(); 
        }
      } else {
        const response = await fetch(`${BACKEND_URL}/api/content/user/bookmarks`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ questionId }),
        });
        
        if (response.ok) {
          setQuestions(prev => prev.map(q => 
            q.id === questionId ? { ...q, isBookmarked: true } : q
          ));
          fetchBookmarks(); 
        }
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    }
  };

  const toggleProgress = async (questionId: string) => {
    try {
      const token = localStorage.getItem('__Pearl_Token');
      const question = questions.find(q => q.id === questionId);
      const newCompletionStatus = !question?.isCompleted;
      
      const response = await fetch(`${BACKEND_URL}/api/content/user/progress`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          questionId, 
          isCompleted: newCompletionStatus 
        }),
      });
      
      if (response.ok) {
        setQuestions(prev => prev.map(q => 
          q.id === questionId ? { ...q, isCompleted: newCompletionStatus } : q
        ));
        fetchProgressStats();
      }
    } catch (error) {
      console.error('Failed to toggle progress:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchCategories(), 
        fetchQuestions(),
        fetchBookmarks(),
        fetchProgressStats()
      ]);
      setLoading(false);
    };
    
    if (currentUser) {
      loadData();
      console.log(currentUser)
    }
  }, [currentUser]);

  const debouncedSearch = useCallback((term: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      fetchQuestions(term, selectedDifficulty, selectedCategory);
    }, 300);
  }, [selectedDifficulty, selectedCategory]);

  useEffect(() => {
    if (activeTab === 'questions') {
      debouncedSearch(searchTerm);
    }
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, debouncedSearch, activeTab]);

  useEffect(() => {
    let filtered = questions;
    
    if (selectedDifficulty) {
      filtered = filtered.filter(q => q.difficulty === selectedDifficulty);
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(q => q.category.id === selectedCategory);
    }
    
    setFilteredQuestions(filtered);
  }, [questions, selectedDifficulty, selectedCategory]);

  const groupedQuestions = filteredQuestions.reduce((acc, question) => {
    const categoryId = question.category.id;
    if (!acc[categoryId]) {
      acc[categoryId] = {
        category: question.category,
        questions: []
      };
    }
    acc[categoryId].questions.push(question);
    return acc;
  }, {} as Record<string, { category: any; questions: Question[] }>);

  const handleVoiceCommand = useCallback((command: string) => {
    console.log('Voice command:', command);
    
    if (command.includes('search for')) {
      const searchQuery = command.replace('search for', '').trim();
      setSearchTerm(searchQuery);
      return;
    }
    
    if (command.includes('bookmarks') || command.includes('bookmark')) {
      setActiveTab('bookmarks');
      return;
    }
    
    if (command.includes('progress') || command.includes('stats')) {
      setActiveTab('progress');
      return;
    }
    
    if (command.includes('questions') || command.includes('all questions')) {
      setActiveTab('questions');
      return;
    }
    if(command.includes('toggle') || command.includes('switch theme')) {
      setDarkMode(prev => !prev);
    }
    
    const categoryCommands = categories.map(cat => ({
      variations: [
        `open ${cat.title.toLowerCase()}`,
        `show ${cat.title.toLowerCase()}`,
        `expand ${cat.title.toLowerCase()}`
      ],
      id: cat.id
    }));
    
    for (const catCmd of categoryCommands) {
      for (const variation of catCmd.variations) {
        if (command.includes(variation)) {
          setExpandedCategories(prev => new Set([...prev, catCmd.id]));
          setSelectedCategory(catCmd.id);
          setActiveTab('questions');
          return;
        }
      }
    }
    
    if (command.includes('easy questions') || command.includes('show easy')) {
      setSelectedDifficulty('Easy');
      setActiveTab('questions');
    } else if (command.includes('medium questions') || command.includes('show medium')) {
      setSelectedDifficulty('Medium');
      setActiveTab('questions');
    } else if (command.includes('hard questions') || command.includes('show hard')) {
      setSelectedDifficulty('Hard');
      setActiveTab('questions');
    } else if (command.includes('all questions') || command.includes('show all')) {
      setSelectedDifficulty('');
      setSelectedCategory('');
      setActiveTab('questions');
    }
    
    if (command.includes('clear search')) {
      setSearchTerm('');
    } else if (command.includes('toggle theme') || command.includes('switch theme')) {
      setDarkMode(prev => !prev);
    }
  }, [categories]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      
      recognition.onresult = (event: any) => {
        const command = event.results[0][0].transcript.toLowerCase().trim();
        handleVoiceCommand(command);
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
      setSpeechRecognition(recognition);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
    };
  }, [handleVoiceCommand, isListening]);

  const toggleVoiceRecognition = () => {
    if (!speechRecognition) return;
    
    if (isListening) {
      speechRecognition.stop();
    } else {
      speechRecognition.start();
    }
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const getDifficultyClasses = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-600/90 text-white border border-green-500/60 px-3 py-1 rounded-full text-xs font-medium';
      case 'Medium': return 'bg-amber-600/90 text-white border border-amber-500/60 px-3 py-1 rounded-full text-xs font-medium';
      case 'Hard': return 'bg-red-600/90 text-white border border-red-500/60 px-3 py-1 rounded-full text-xs font-medium';
      default: return 'bg-gray-600/90 text-white border border-gray-500/60 px-3 py-1 rounded-full text-xs font-medium';
    }
  };

  const renderQuestionItem = (question: Question, qIndex: number) => (
    <div
      key={question.id}
      className="p-6 hover:bg-gray-700/30 dark:hover:bg-gray-800/30 transition-all duration-300"
      style={{ animationDelay: `${qIndex * 50}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-sm font-mono text-gray-500 dark:text-gray-400">
              #{question.questionId}
            </span>
            <span className={getDifficultyClasses(question.difficulty)}>
              {question.difficulty}
            </span>
            {question.isCompleted && (
              <CheckCircle size={16} className="text-green-400" />
            )}
          </div>
          
          <h3 className="text-lg font-medium text-gray-100 dark:text-gray-200 mb-2">
            {question.title}
          </h3>
          
          {question.tags && question.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {question.tags.map((tag, tagIndex) => (
                <span
                  key={tagIndex}
                  className="px-2 py-1 text-xs bg-gray-700/50 dark:bg-gray-600/50 text-gray-300 dark:text-gray-400 rounded-md border border-gray-600/50 dark:border-gray-500/50"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={() => toggleProgress(question.id)}
            className={`p-2 rounded-lg transition-all duration-300 ${
              question.isCompleted 
                ? 'text-green-400 hover:text-green-300 hover:bg-green-500/10' 
                : 'text-gray-400 hover:text-green-400 hover:bg-green-500/10'
            }`}
            title={question.isCompleted ? "Mark as incomplete" : "Mark as complete"}
          >
            <CheckCircle size={16} />
          </button>
          
          <button
            onClick={() => toggleBookmark(question.id)}
            className={`p-2 rounded-lg transition-all duration-300 ${
              question.isBookmarked 
                ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-500/10' 
                : 'text-gray-400 hover:text-blue-400 hover:bg-blue-500/10'
            }`}
            title={question.isBookmarked ? "Remove bookmark" : "Add bookmark"}
          >
            {question.isBookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
          </button>
          
          {question.ytLink && (
            <a
              href={question.ytLink}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-300"
              title="Watch on YouTube"
            >
              <Play size={16} />
            </a>
          )}
          
          {question.p1Link && (
            <a
              href={question.p1Link}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg transition-all duration-300"
              title="Problem Link 1"
            >
              <ExternalLink size={16} />
            </a>
          )}
          
          {question.p2Link && (
            <a
              href={question.p2Link}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-lg transition-all duration-300"
              title="Problem Link 2"
            >
              <BookOpen size={16} />
            </a>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 dark:from-black dark:via-slate-950 dark:to-black flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 dark:from-black dark:via-slate-950 dark:to-black relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(14,165,233,0.15)_1px,transparent_0)] bg-[length:20px_20px]"></div>
      
      <div className="relative min-h-screen">
        <header className="sticky top-0 z-50 bg-gray-900/80 dark:bg-black/80 backdrop-blur-xl border-b border-gray-800/50 dark:border-gray-700/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-teal-500 bg-clip-text text-transparent">
                  PearlChef
                </h1>
              </div>
              
              <div className="flex items-center space-x-4 text-white">
                
                <VoiceControl onCommand={handleVoiceCommand}></VoiceControl>
                
                <ThemeToggle></ThemeToggle>
                
                <Avatar user={currentUser as User} />
                
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-teal-400 transition-colors border-slate-700 border"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8 border-b border-gray-800/50 dark:border-gray-700/50">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('questions')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'questions'
                    ? 'border-cyan-500 text-cyan-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <BookOpen size={16} />
                  All Questions
                </div>
              </button>
              <button
                onClick={() => setActiveTab('bookmarks')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'bookmarks'
                    ? 'border-cyan-500 text-cyan-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Bookmark size={16} />
                  Bookmarks ({bookmarks.length})
                </div>
              </button>
              <button
                onClick={() => setActiveTab('progress')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'progress'
                    ? 'border-cyan-500 text-cyan-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <BarChart3 size={16} />
                  Progress
                </div>
              </button>
            </nav>
          </div>

          {activeTab === 'questions' && (
            <div className="mb-8 space-y-4 animate-[fadeInUp_0.8s_ease-out]">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
                  <input
                    type="text"
                    placeholder="Search questions... (or use voice command)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-800/50 dark:bg-gray-900/50 border border-gray-700/50 dark:border-gray-600/50 rounded-xl text-gray-100 dark:text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 focus:scale-[1.02] transition-all duration-300 backdrop-blur-sm"
                  />
                </div>
                
               <div className="flex gap-4">
      {/* Difficulty Dropdown */}
      <div className="relative w-48">
        <Listbox value={selectedDifficulty} onChange={setSelectedDifficulty}>
          <div className="relative">
            <Listbox.Button className="w-full flex justify-between items-center px-4 py-3 bg-gray-800/50 backdrop-blur-md border border-gray-700/50 rounded-xl text-gray-100 font-medium shadow-md hover:border-cyan-400 focus:ring-2 focus:ring-cyan-500 transition-all duration-300">
              <span>{selectedDifficulty || "All Difficulties"}</span>
              <ChevronUpDownIcon className="h-5 w-5 text-cyan-400 transition-transform duration-300" />
            </Listbox.Button>
            <Listbox.Options className="absolute mt-2 w-full bg-gray-900/90 backdrop-blur-xl rounded-xl shadow-lg border border-gray-700/50 z-50">
              {difficulties.map((diff, idx) => (
                <Listbox.Option
                  key={idx}
                  value={diff === "All Difficulties" ? "" : diff}
                  className={({ active }) =>
                    `cursor-pointer select-none px-4 py-3 text-gray-100 transition ${
                      active ? "bg-cyan-500/20 text-cyan-300" : ""
                    }`
                  }
                >
                  {diff}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </div>
        </Listbox>
      </div>

      {/* Category Dropdown */}
      <div className="relative w-64">
        <Listbox value={selectedCategory} onChange={setSelectedCategory}>
          <div className="relative">
            <Listbox.Button className="w-full flex justify-between items-center px-4 py-3 bg-gray-800/50 backdrop-blur-md border border-gray-700/50 rounded-xl text-gray-100 font-medium shadow-md hover:border-cyan-400 focus:ring-2 focus:ring-cyan-500 transition-all duration-300">
              <span>
                {selectedCategory
                  ? categories.find((cat) => cat.id === selectedCategory)?.title
                  : "All Categories"}
              </span>
              <ChevronUpDownIcon className="h-5 w-5 text-cyan-400 transition-transform duration-300" />
            </Listbox.Button>
            <Listbox.Options className="absolute mt-2 w-full max-h-64 overflow-y-auto bg-gray-900/90 backdrop-blur-xl rounded-xl shadow-lg border border-gray-700/50 z-50">
              <Listbox.Option
                value=""
                className={({ active }) =>
                  `cursor-pointer select-none px-4 py-3 text-gray-100 transition ${
                    active ? "bg-cyan-500/20 text-cyan-300" : ""
                  }`
                }
              >
                All Categories
              </Listbox.Option>
              {categories.map((category) => (
                <Listbox.Option
                  key={category.id}
                  value={category.id}
                  className={({ active }) =>
                    `cursor-pointer select-none px-4 py-3 text-gray-100 transition ${
                      active ? "bg-cyan-500/20 text-cyan-300" : ""
                    }`
                  }
                >
                  {category.title}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </div>
        </Listbox>
      </div>
    </div>
              </div>
              
              {speechRecognition && (
                <div className="text-sm text-gray-500 bg-gray-800/30 dark:bg-gray-900/30 rounded-lg p-3 border border-gray-700/30 dark:border-gray-600/30">
                  Try voice commands: "Search for sorting", "Toggle theme", "Bookmarks", "Progress"
                </div>
              )}
            </div>
          )}
          {activeTab === 'questions' && (
            <div className="space-y-6">
              {Object.entries(groupedQuestions).length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-500 text-lg">
                    No questions found matching your criteria
                  </div>
                </div>
              ) : (
                Object.entries(groupedQuestions)
                  .sort(([, a], [, b]) => a.category.slNo - b.category.slNo)
                  .map(([categoryId, { category, questions }], index) => (
                    <div
                      key={categoryId}
                      className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 dark:from-gray-900/50 dark:to-black/50 rounded-xl border border-gray-700/50 dark:border-gray-600/50 overflow-hidden backdrop-blur-sm shadow-2xl hover:shadow-cyan-500/10 hover:-translate-y-2 transition-all duration-500 animate-[fadeInUp_0.8s_ease-out]"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <button
                        onClick={() => toggleCategory(categoryId)}
                        className="w-full px-6 py-4 flex items-center justify-between bg-gray-800/30 dark:bg-gray-900/30 hover:bg-gray-700/40 dark:hover:bg-gray-800/40 transition-all duration-300"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium text-cyan-400 bg-cyan-500/20 px-3 py-1 rounded-full border border-cyan-500/30">
                            #{category.slNo}
                          </span>
                          <h2 className="text-xl font-semibold text-gray-100 dark:text-gray-200 drop-shadow-sm">
                            {category.title}
                          </h2>
                          <span className="text-sm text-gray-400 dark:text-gray-500">
                            ({questions.length} questions)
                          </span>
                        </div>
                        <div className="transform transition-transform duration-300">
                          {expandedCategories.has(categoryId) ? 
                            <ChevronDown size={20} className="text-gray-400" /> : 
                            <ChevronRight size={20} className="text-gray-400" />
                          }
                        </div>
                      </button>

                      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
                        expandedCategories.has(categoryId) ? 'max-h-none opacity-100' : 'max-h-0 opacity-0'
                      }`}>
                        <div className="divide-y divide-gray-700/30 dark:divide-gray-600/30">
                          {questions.map((question, qIndex) => renderQuestionItem(question, qIndex))}
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          )}

          {activeTab === 'bookmarks' && (
            <div className="space-y-6 min-h-[400px]">
              {bookmarks.length === 0 ? (
                <div className="text-center py-12">
                  <Bookmark className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <div className="text-gray-500 text-lg mb-2">No bookmarks yet</div>
                  <div className="text-gray-600 text-sm">Start bookmarking questions to see them here</div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 dark:from-gray-900/50 dark:to-black/50 rounded-xl border border-gray-700/50 dark:border-gray-600/50 overflow-hidden backdrop-blur-sm shadow-2xl">
                  <div className="px-6 py-4 bg-gray-800/30 dark:bg-gray-900/30">
                    <h2 className="text-xl font-semibold text-gray-100 dark:text-gray-200 flex items-center gap-2">
                      <BookmarkCheck className="text-blue-400" size={20} />
                      Your Bookmarks ({bookmarks.length})
                    </h2>
                  </div>
                  <div className="divide-y divide-gray-700/30 dark:divide-gray-600/30">
                    {bookmarks.map((bookmark, index) => (
                      <div key={bookmark.id} className="p-6 hover:bg-gray-700/30 dark:hover:bg-gray-800/30 transition-all duration-300">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <span className={getDifficultyClasses(bookmark.question.difficulty)}>
                                {bookmark.question.difficulty}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {bookmark.question.category.title}
                              </span>
                            </div>
                            <h3 className="text-lg font-medium text-gray-100 dark:text-gray-200">
                              {bookmark.question.title}
                            </h3>
                          </div>
                          <button
                            onClick={() => toggleBookmark(bookmark.questionId)}
                            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-all duration-300"
                            title="Remove bookmark"
                          >
                            <BookmarkCheck size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'progress' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 dark:from-gray-900/50 dark:to-black/50 rounded-xl border border-gray-700/50 dark:border-gray-600/50 p-6 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-100 dark:text-gray-200">Total Questions</h3>
                    <Target className="text-gray-400" size={24} />
                  </div>
                  <div className="text-3xl font-bold text-cyan-400 mb-2">{progressStats.totalQuestions}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Available to solve</div>
                </div>

                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 dark:from-gray-900/50 dark:to-black/50 rounded-xl border border-gray-700/50 dark:border-gray-600/50 p-6 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-100 dark:text-gray-200">Completed</h3>
                    <CheckCircle className="text-green-400" size={24} />
                  </div>
                  <div className="text-3xl font-bold text-green-400 mb-2">{progressStats.completedQuestions}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Questions solved</div>
                </div>

                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 dark:from-gray-900/50 dark:to-black/50 rounded-xl border border-gray-700/50 dark:border-gray-600/50 p-6 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-100 dark:text-gray-200">Progress</h3>
                    <Trophy className="text-yellow-400" size={24} />
                  </div>
                  <div className="text-3xl font-bold text-yellow-400 mb-2">{progressStats.completionPercentage}%</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Completion rate</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 dark:from-gray-900/50 dark:to-black/50 rounded-xl border border-gray-700/50 dark:border-gray-600/50 p-6 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-gray-100 dark:text-gray-200 mb-4 flex items-center gap-2">
                  <BarChart3 className="text-cyan-400" size={20} />
                  Progress Overview
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-300 dark:text-gray-400">Overall Progress</span>
                      <span className="text-gray-300 dark:text-gray-400">{progressStats.completedQuestions}/{progressStats.totalQuestions}</span>
                    </div>
                    <div className="w-full bg-gray-700 dark:bg-gray-800 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${progressStats.completionPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="text-center p-4 bg-gray-700/30 dark:bg-gray-800/30 rounded-lg">
                      <div className="text-2xl font-bold text-green-400 mb-1">{Math.floor((progressStats.completedQuestions / progressStats.totalQuestions) * 100) || 0}%</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Easy</div>
                    </div>
                    <div className="text-center p-4 bg-gray-700/30 dark:bg-gray-800/30 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-400 mb-1">{Math.floor((progressStats.completedQuestions / progressStats.totalQuestions) * 100) || 0}%</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Medium</div>
                    </div>
                    <div className="text-center p-4 bg-gray-700/30 dark:bg-gray-800/30 rounded-lg">
                      <div className="text-2xl font-bold text-red-400 mb-1">{Math.floor((progressStats.completedQuestions / progressStats.totalQuestions) * 100) || 0}%</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Hard</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        <footer className="mt-16 py-8 border-t border-gray-800/50 dark:border-gray-700/50 bg-gray-900/30 dark:bg-black/30">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              © 2024 PearlChef. Elevating your coding journey.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default FlowPage;