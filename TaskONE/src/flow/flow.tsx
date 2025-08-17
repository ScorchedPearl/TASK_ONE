import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Moon, Sun, Mic, MicOff, ChevronDown, ChevronRight, Play, ExternalLink, BookOpen, CheckCircle } from 'lucide-react';
import { useUser } from '@/providers/userprovider';
import Loader from '@/loading';
import { useNavigate } from 'react-router-dom';

const Avatar = ({ user }: { user: any }) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex items-center space-x-3">
      <div className="relative">
        {user.avatar ? (
          <img 
            src={user.avatar} 
            alt={user.name}
            className="w-10 h-10 rounded-full border-2 border-cyan-500/30 object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm border-2 border-cyan-500/30">
            {getInitials(user.name)}
          </div>
        )}
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-900"></div>
      </div>
      <div className="hidden sm:block">
        <p className="text-sm font-medium text-gray-200">{user.name}</p>
        <p className="text-xs text-gray-400">{user.email}</p>
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

const FlowPage: React.FC = () => {
  const { currentUser, logout } = useUser();
  const navigate = useNavigate();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['1', '2']));
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

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const fetchCategories = async () => {
    try {
      console.log('Fetching categories...');
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
      params.append('limit', '100'); // Get more questions for better UX
      
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

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchCategories(), fetchQuestions()]);
      setLoading(false);
    };
    
    if (currentUser) {
      loadData();
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
    debouncedSearch(searchTerm);
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, debouncedSearch]);

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
          return;
        }
      }
    }
    
    if (command.includes('easy questions') || command.includes('show easy')) {
      setSelectedDifficulty('Easy');
    } else if (command.includes('medium questions') || command.includes('show medium')) {
      setSelectedDifficulty('Medium');
    } else if (command.includes('hard questions') || command.includes('show hard')) {
      setSelectedDifficulty('Hard');
    } else if (command.includes('all questions') || command.includes('show all')) {
      setSelectedDifficulty('');
      setSelectedCategory('');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(14,165,233,0.15)_1px,transparent_0)] bg-[length:20px_20px]"></div>
      
      <div className="relative min-h-screen">
        <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  GeekHeaven
                </h1>
              </div>
              
              <div className="flex items-center space-x-4">
                {speechRecognition && (
                  <button
                    onClick={toggleVoiceRecognition}
                    className={`p-2 rounded-full transition-all duration-300 ${
                      isListening 
                        ? 'bg-cyan-500/20 text-cyan-400 animate-pulse' 
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-cyan-400'
                    }`}
                    title={isListening ? 'Stop listening' : 'Start voice command'}
                  >
                    {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                  </button>
                )}
                
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 rounded-full bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-yellow-400 transition-all duration-300 hover:rotate-180"
                  title="Toggle theme"
                >
                  {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                
                <Avatar user={currentUser} />
                
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-cyan-400 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
    
          <div className="mb-8 space-y-4 animate-[fadeInUp_0.8s_ease-out]">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
                <input
                  type="text"
                  placeholder="Search questions... (or use voice command)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 focus:scale-[1.02] transition-all duration-300 backdrop-blur-sm"
                />
              </div>
              
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-gray-100 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300"
              >
                <option value="">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
              
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-gray-100 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300"
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
              <div className="text-sm text-gray-500 bg-gray-800/30 rounded-lg p-3 border border-gray-700/30">
                💡 Try voice commands: "Open Arrays", "Show easy questions", "Search for sorting", "Toggle theme"
              </div>
            )}
          </div>

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
                    className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50 overflow-hidden backdrop-blur-sm shadow-2xl hover:shadow-cyan-500/10 hover:-translate-y-2 transition-all duration-500 animate-[fadeInUp_0.8s_ease-out]"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <button
                      onClick={() => toggleCategory(categoryId)}
                      className="w-full px-6 py-4 flex items-center justify-between bg-gray-800/30 hover:bg-gray-700/40 transition-all duration-300"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-cyan-400 bg-cyan-500/20 px-3 py-1 rounded-full border border-cyan-500/30">
                          #{category.slNo}
                        </span>
                        <h2 className="text-xl font-semibold text-gray-100 drop-shadow-sm">
                          {category.title}
                        </h2>
                        <span className="text-sm text-gray-400">
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
                      <div className="divide-y divide-gray-700/30">
                        {questions.map((question, qIndex) => (
                          <div
                            key={question.id}
                            className="p-6 hover:bg-gray-700/30 transition-all duration-300"
                            style={{ animationDelay: `${qIndex * 50}ms` }}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <span className="text-sm font-mono text-gray-500">
                                    #{question.questionId}
                                  </span>
                                  <span className={getDifficultyClasses(question.difficulty)}>
                                    {question.difficulty}
                                  </span>
                                  {question.isCompleted && (
                                    <CheckCircle size={16} className="text-green-400" />
                                  )}
                                </div>
                                
                                <h3 className="text-lg font-medium text-gray-100 mb-2">
                                  {question.title}
                                </h3>
                                
                                {question.tags && question.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-2 mb-3">
                                    {question.tags.map((tag, tagIndex) => (
                                      <span
                                        key={tagIndex}
                                        className="px-2 py-1 text-xs bg-gray-700/50 text-gray-300 rounded-md border border-gray-600/50"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex items-center space-x-2 ml-4">
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
                        ))}
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </main>

        <footer className="mt-16 py-8 border-t border-gray-800/50 bg-gray-900/30">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-gray-500 text-sm">
              © 2024 Pearl. Elevating your coding journey.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default FlowPage;