import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ChevronDown, ChevronRight, BookOpen, Bookmark, BarChart3, BookmarkCheck, CheckCircle, Trophy, Target, Download, ChevronLeft } from 'lucide-react';
import { useUser } from '@/providers/userprovider';
import Loader from '@/loading';
import { useNavigate } from 'react-router-dom';
import type { User } from '@/types/auth_interface';
import Header from '@/components/pearl/headerflow';
import SearchFilters from '@/components/pearl/searchandfilter';
import QuestionCard from '@/components/pearl/card';
import QuestionModal from '@/components/pearl/details';

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
  description?: string;
  hints?: string[];
  lastAttempted?: string;
  timeSpent?: number;
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
  easyCompleted?: number;
  mediumCompleted?: number;
  hardCompleted?: number;
  easyTotal?: number;
  mediumTotal?: number;
  hardTotal?: number;
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
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [progressStats, setProgressStats] = useState<ProgressStats>({
    totalQuestions: 0,
    completedQuestions: 0,
    completionPercentage: 0
  });
  const [loading, setLoading] = useState(true);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNext: false,
    hasPrev: false
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('default');
  const [showCompleted, setShowCompleted] = useState<string>('all');
  
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['1', '2']));
  const [activeTab, setActiveTab] = useState<'questions' | 'bookmarks' | 'progress'>('questions');
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());
  
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  
  const [isListening, setIsListening] = useState(false);
  const [speechRecognition, setSpeechRecognition] = useState<any>(null);
  
  const searchTimeoutRef = useRef<NodeJS.Timeout>(null);
  const recognitionRef = useRef<any>(null);
  const isFetchingRef = useRef(false); 
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
  const [questionsPerPage] = useState(20);


  const QUESTIONS_PER_PAGE = useMemo(() => questionsPerPage, [questionsPerPage]);

  useEffect(() => {
    if (!currentUser) {
      navigate('/auth');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const fetchCategories = useCallback(async () => {
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
  }, [BACKEND_URL]);

  const fetchQuestions = useCallback(async (search = '', difficulty = '', category = '', page = 1, fromPagination = false) => {
    if (isFetchingRef.current) {
      console.log('Fetch already in progress, skipping...');
      return;
    }

    try {
      isFetchingRef.current = true;
      setQuestionsLoading(true);
      
      const token = localStorage.getItem('__Pearl_Token');
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (difficulty) params.append('difficulty', difficulty);
      if (category) params.append('category', category);
      params.append('page', page.toString());
      params.append('limit', QUESTIONS_PER_PAGE.toString());
      
      console.log('Fetching questions with params:', {
        search, difficulty, category, page, limit: QUESTIONS_PER_PAGE, fromPagination
      });
      
      const response = await fetch(`${BACKEND_URL}/api/content?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data: { data: ContentData } = await response.json();
        console.log('Received pagination data:', data.data.pagination);
        
        setQuestions(data.data.questions);

        const newPagination = {
          currentPage: Math.max(1, data.data.pagination.currentPage || page),
          totalPages: Math.max(1, data.data.pagination.totalPages || 1),
          totalItems: Math.max(0, data.data.pagination.totalItems || 0),
          hasNext: data.data.pagination.hasNext || false,
          hasPrev: data.data.pagination.hasPrev || false
        };

        if (newPagination.currentPage > newPagination.totalPages) {
          newPagination.currentPage = newPagination.totalPages;
        }
        
        newPagination.hasNext = newPagination.currentPage < newPagination.totalPages;
        newPagination.hasPrev = newPagination.currentPage > 1;
        
        console.log('Setting pagination state to:', newPagination);
        setPagination(newPagination);
      } else {
        console.error('Failed to fetch questions:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    } finally {
      setQuestionsLoading(false);
      isFetchingRef.current = false;
    }
  }, [BACKEND_URL, QUESTIONS_PER_PAGE]);

  const fetchBookmarks = useCallback(async () => {
    try {
      const token = localStorage.getItem('__Pearl_Token');
      const response = await fetch(`${BACKEND_URL}/api/content/user/bookmarks?limit=200`, {
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
  }, [BACKEND_URL]);

  const fetchProgressStats = useCallback(async () => {
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
  }, [BACKEND_URL]);

  const toggleBookmark = useCallback(async (questionId: string) => {
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
  }, [questions, BACKEND_URL, fetchBookmarks]);

  const toggleProgress = useCallback(async (questionId: string) => {
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
  }, [questions, BACKEND_URL, fetchProgressStats]);

  const handleBulkBookmark = useCallback(async () => {
    const promises = Array.from(selectedQuestions).map(questionId => toggleBookmark(questionId));
    await Promise.all(promises);
    setSelectedQuestions(new Set());
  }, [selectedQuestions, toggleBookmark]);

  const handleBulkComplete = useCallback(async () => {
    const promises = Array.from(selectedQuestions).map(questionId => toggleProgress(questionId));
    await Promise.all(promises);
    setSelectedQuestions(new Set());
  }, [selectedQuestions, toggleProgress]);

  const exportProgress = useCallback(() => {
    const data = {
      user: currentUser?.name,
      exportDate: new Date().toISOString(),
      stats: progressStats,
      completedQuestions: questions.filter(q => q.isCompleted).map(q => ({
        id: q.questionId,
        title: q.title,
        difficulty: q.difficulty,
        category: q.category.title
      })),
      bookmarkedQuestions: bookmarks.map(b => ({
        id: b.question.questionId,
        title: b.question.title,
        difficulty: b.question.difficulty
      }))
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pearl-chef-progress-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [currentUser?.name, progressStats, questions, bookmarks]);

 
  const handlePageChange = useCallback((newPage: number) => {
    console.log('handlePageChange called with page:', newPage);
    console.log('Current pagination state:', pagination);
    
    if (newPage >= 1 && newPage <= pagination.totalPages && newPage !== pagination.currentPage) {
      console.log('Page change is valid, fetching questions...');
      fetchQuestions(searchTerm, selectedDifficulty, selectedCategory, newPage, true);
      document.querySelector('.questions-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [pagination, searchTerm, selectedDifficulty, selectedCategory, fetchQuestions]);

  const resetPagination = useCallback(() => {
    console.log('Resetting pagination to page 1');
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await Promise.all([
        fetchCategories(), 
        fetchQuestions('', '', '', 1),
        fetchBookmarks(),
        fetchProgressStats()
      ]);
      setLoading(false);
    };
    
    if (currentUser) {
      loadInitialData();
    }
  }, [currentUser]); 

  
  const debouncedSearch = useCallback((term: string, difficulty: string, category: string, resetPage = true) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      console.log('Debounced search triggered', { term, difficulty, category, resetPage });
      if (resetPage) {
        resetPagination();
      }

      fetchQuestions(term, difficulty, category, resetPage ? 1 : 1);
    }, 300);
  }, [resetPagination, fetchQuestions]); 
  
  useEffect(() => {
    if (activeTab === 'questions') {
      console.log('Search parameters changed, triggering debounced search');
      debouncedSearch(searchTerm, selectedDifficulty, selectedCategory, true);
    }
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, selectedDifficulty, selectedCategory, activeTab, debouncedSearch]);


  useEffect(() => {
    if (currentUser && activeTab === 'questions') {
      
      fetchQuestions(searchTerm, selectedDifficulty, selectedCategory, 1);
    }
  }, [questionsPerPage]); 
  const filteredAndSortedQuestions = useMemo(() => {
    let filtered = questions;
    
    if (showCompleted === 'completed') {
      filtered = filtered.filter(q => q.isCompleted);
    } else if (showCompleted === 'incomplete') {
      filtered = filtered.filter(q => !q.isCompleted);
    }
    
    switch (sortBy) {
      case 'difficulty':
        const difficultyOrder = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
        filtered.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
        break;
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'category':
        filtered.sort((a, b) => a.category.slNo - b.category.slNo);
        break;
      case 'recent':
        filtered.sort((a, b) => {
          const aDate = new Date(a.lastAttempted || 0);
          const bDate = new Date(b.lastAttempted || 0);
          return bDate.getTime() - aDate.getTime();
        });
        break;
    }
    
    return filtered;
  }, [questions, showCompleted, sortBy]);

  const groupedQuestions = useMemo(() => {
    return filteredAndSortedQuestions.reduce((acc, question) => {
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
  }, [filteredAndSortedQuestions]);

 
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
    
    if (command.includes('bulk actions') || command.includes('select multiple')) {
      setShowBulkActions(prev => !prev);
      return;
    }
    
    if (command.includes('export progress')) {
      exportProgress();
      return;
    }
    
    if (command.includes('next page')) {
      if (pagination.hasNext) {
        handlePageChange(pagination.currentPage + 1);
      }
      return;
    }
    
    if (command.includes('previous page') || command.includes('prev page')) {
      if (pagination.hasPrev) {
        handlePageChange(pagination.currentPage - 1);
      }
      return;
    }
    
    if (command.includes('first page')) {
      handlePageChange(1);
      return;
    }
    
    if (command.includes('last page')) {
      handlePageChange(pagination.totalPages);
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
  }, [categories, exportProgress, pagination, handlePageChange]); 

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

  const toggleCategory = useCallback((categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  }, []);

  const handleQuestionSelect = useCallback((questionId: string) => {
    setSelectedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  }, []);

  const handleShowDetails = useCallback((question: Question) => {
    setSelectedQuestion(question);
    setShowQuestionModal(true);
  }, []);

 
  const PaginationControls = useMemo(() => {
    const getPageNumbers = () => {
      const pages = [];
      const maxVisible = 5;
      let start = Math.max(1, pagination.currentPage - Math.floor(maxVisible / 2));
      let end = Math.min(pagination.totalPages, start + maxVisible - 1);
      
      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      return pages;
    };

    if (pagination.totalPages <= 1) return null;

    return (
      <div className="mt-8 w-full">
        <div className="flex items-center justify-between px-6 py-4 bg-gray-800 rounded-lg border border-gray-600 shadow-lg">
          <div className="text-sm text-gray-300">
            Showing {((pagination.currentPage - 1) * QUESTIONS_PER_PAGE) + 1} to{' '}
            {Math.min(pagination.currentPage * QUESTIONS_PER_PAGE, pagination.totalItems)} of{' '}
            {pagination.totalItems} questions
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrev || questionsLoading}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ minWidth: '90px' }}
            >
              <ChevronLeft size={16} className="mr-1" />
              Previous
            </button>
            
            {pagination.currentPage > 3 && (
              <>
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={questionsLoading}
                  className="px-3 py-2 text-sm font-medium text-white hover:bg-gray-600 rounded-lg disabled:opacity-50"
                  style={{ minWidth: '40px' }}
                >
                  1
                </button>
                {pagination.currentPage > 4 && (
                  <span className="px-2 text-sm text-gray-400">...</span>
                )}
              </>
            )}
        
            {getPageNumbers().map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                disabled={questionsLoading}
                className={`px-3 py-2 text-sm font-medium rounded-lg disabled:opacity-50 ${
                  page === pagination.currentPage
                    ? 'bg-cyan-600 text-white border border-cyan-500'
                    : 'text-white hover:bg-gray-600'
                }`}
                style={{ minWidth: '40px' }}
              >
                {page}
              </button>
            ))}
            
            {pagination.currentPage < pagination.totalPages - 2 && (
              <>
                {pagination.currentPage < pagination.totalPages - 3 && (
                  <span className="px-2 text-sm text-gray-400">...</span>
                )}
                <button
                  onClick={() => handlePageChange(pagination.totalPages)}
                  disabled={questionsLoading}
                  className="px-3 py-2 text-sm font-medium text-white hover:bg-gray-600 rounded-lg disabled:opacity-50"
                  style={{ minWidth: '40px' }}
                >
                  {pagination.totalPages}
                </button>
              </>
            )}
            
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNext || questionsLoading}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ minWidth: '70px' }}
            >
              Next
              <ChevronRight size={16} className="ml-1" />
            </button>
          </div>
        </div>
      </div>
    );
  }, [pagination, QUESTIONS_PER_PAGE, handlePageChange, questionsLoading]);

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
        <Header 
          currentUser={currentUser as User}
          onLogout={logout}
          onVoiceCommand={handleVoiceCommand}
        />

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
                  All Questions ({pagination.totalItems || questions.length})
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
                  Progress ({progressStats.completionPercentage}%)
                </div>
              </button>
            </nav>
          </div>

          {activeTab === 'questions' && (
            <div className="questions-section">
              <SearchFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedDifficulty={selectedDifficulty}
                setSelectedDifficulty={setSelectedDifficulty}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                categories={categories}
                speechRecognition={speechRecognition}
                sortBy={sortBy}
                setSortBy={setSortBy}
                showCompleted={showCompleted}
                setShowCompleted={setShowCompleted}
              />

              <div className="mb-6 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowBulkActions(prev => !prev)}
                    className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                      showBulkActions 
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' 
                        : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-600/50'
                    }`}
                  >
                    {showBulkActions ? 'Hide' : 'Show'} Bulk Actions
                  </button>
                  
                  {showBulkActions && selectedQuestions.size > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">
                        {selectedQuestions.size} selected
                      </span>
                      <button
                        onClick={handleBulkComplete}
                        className="px-3 py-1 bg-green-500/20 text-green-300 hover:bg-green-500/30 border border-green-500/30 rounded-md text-sm transition-all duration-200"
                      >
                        Mark Complete
                      </button>
                      <button
                        onClick={handleBulkBookmark}
                        className="px-3 py-1 bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border border-blue-500/30 rounded-md text-sm transition-all duration-200"
                      >
                        Bookmark
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={exportProgress}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-sm transition-all duration-200"
                >
                  <Download size={16} />
                  Export Progress
                </button>
              </div>

              {questionsLoading && (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
                </div>
              )}

              <div className="space-y-6">
                {!questionsLoading && Object.entries(groupedQuestions).length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-500 text-lg">
                      No questions found matching your criteria
                    </div>
                  </div>
                ) : (
                  !questionsLoading && Object.entries(groupedQuestions)
                    .sort(([, a], [, b]) => a.category.slNo - b.category.slNo)
                    .map(([categoryId, { category, questions }], index) => (
                      <div
                        key={categoryId}
                        className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 dark:from-gray-900/50 dark:to-black/50 rounded-xl border border-gray-700/50 dark:border-gray-600/50 overflow-hidden backdrop-blur-sm shadow-2xl hover:shadow-cyan-500/10 hover:-translate-y-1 transition-all duration-500 animate-[fadeInUp_0.8s_ease-out]"
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
                            <div className="text-xs text-gray-500">
                              {questions.filter(q => q.isCompleted).length} completed
                            </div>
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
                            {questions.map((question, qIndex) => (
                              <QuestionCard
                                key={question.id}
                                question={question}
                                qIndex={qIndex}
                                isSelected={selectedQuestions.has(question.id)}
                                onToggleProgress={toggleProgress}
                                onToggleBookmark={toggleBookmark}
                                onToggleSelect={showBulkActions ? handleQuestionSelect : undefined}
                                showBulkActions={showBulkActions}
                                onShowDetails={handleShowDetails}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>

              {PaginationControls}
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
                    {bookmarks.map((bookmark, index) => {
                      const question: Question = {
                        id: bookmark.questionId,
                        questionId: bookmark.question.questionId,
                        title: bookmark.question.title,
                        difficulty: bookmark.question.difficulty,
                        tags: bookmark.question.tags || [],
                        category: bookmark.question.category,
                        isCompleted: bookmark.question.isCompleted || false,
                        isBookmarked: true,
                        ytLink: bookmark.question.ytLink,
                        p1Link: bookmark.question.p1Link,
                        p2Link: bookmark.question.p2Link
                      };
                      
                      return (
                        <QuestionCard
                          key={bookmark.id}
                          question={question}
                          qIndex={index}
                          onToggleProgress={toggleProgress}
                          onToggleBookmark={toggleBookmark}
                          onShowDetails={handleShowDetails}
                        />
                      );
                    })}
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
                    <div className="w-full bg-gray-700 dark:bg-gray-800 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-cyan-400 to-blue-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${progressStats.completionPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="text-center p-4 bg-gray-700/30 dark:bg-gray-800/30 rounded-lg">
                      <div className="text-2xl font-bold text-green-400 mb-1">
                        {progressStats.easyCompleted || Math.floor((progressStats.completedQuestions / 3))}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Easy ({progressStats.easyTotal || Math.floor(progressStats.totalQuestions / 3)})
                      </div>
                    </div>
                    <div className="text-center p-4 bg-gray-700/30 dark:bg-gray-800/30 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-400 mb-1">
                        {progressStats.mediumCompleted || Math.floor((progressStats.completedQuestions / 3))}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Medium ({progressStats.mediumTotal || Math.floor(progressStats.totalQuestions / 3)})
                      </div>
                    </div>
                    <div className="text-center p-4 bg-gray-700/30 dark:bg-gray-800/30 rounded-lg">
                      <div className="text-2xl font-bold text-red-400 mb-1">
                        {progressStats.hardCompleted || Math.floor((progressStats.completedQuestions / 3))}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Hard ({progressStats.hardTotal || Math.floor(progressStats.totalQuestions / 3)})
                      </div>
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
              © 2024 PearlChef. Elevating your coding journey with modern tools.
            </p>
          </div>
        </footer>
      </div>

      <QuestionModal
        question={selectedQuestion}
        isOpen={showQuestionModal}
        onClose={() => setShowQuestionModal(false)}
        onToggleProgress={toggleProgress}
        onToggleBookmark={toggleBookmark}
      />
    </div>
  );
};

export default FlowPage;