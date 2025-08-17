import { useState, useEffect, useRef } from 'react';
import { Search, Filter, X, ArrowUpDown, Clock } from 'lucide-react';
import { Listbox } from '@headlessui/react';
import { ChevronUpDownIcon } from "@heroicons/react/24/outline";

interface Category {
  id: string;
  title: string;
  slNo: number;
  questionCount: number;
}

interface SearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedDifficulty: string;
  setSelectedDifficulty: (difficulty: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  categories: Category[];
  speechRecognition: any;
  sortBy: string;
  setSortBy: (sort: string) => void;
  showCompleted: string;
  setShowCompleted: (show: string) => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  selectedDifficulty,
  setSelectedDifficulty,
  selectedCategory,
  setSelectedCategory,
  categories,
  speechRecognition,
  sortBy,
  setSortBy,
  showCompleted,
  setShowCompleted
}) => {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const difficulties = ["All Difficulties", "Easy", "Medium", "Hard"];
  const sortOptions = [
    { value: "default", label: "Default Order" },
    { value: "difficulty", label: "Sort by Difficulty" },
    { value: "title", label: "Sort by Title" },
    { value: "category", label: "Sort by Category" },
    { value: "recent", label: "Recently Added" }
  ];
  const completionOptions = [
    { value: "all", label: "All Questions" },
    { value: "completed", label: "Completed Only" },
    { value: "incomplete", label: "Incomplete Only" }
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
        setShowSuggestions(true);
      }
      if (e.key === 'Escape') {
        setShowSuggestions(false);
        searchRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('pearl_recent_searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  const handleSearchSubmit = (term: string) => {
    if (term.trim() && !recentSearches.includes(term)) {
      const newSearches = [term, ...recentSearches.slice(0, 4)]; 
      setRecentSearches(newSearches);
      localStorage.setItem('pearl_recent_searches', JSON.stringify(newSearches));
    }
    setShowSuggestions(false);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedDifficulty('');
    setSelectedCategory('');
    setSortBy('default');
    setShowCompleted('all');
  };

  const hasActiveFilters = searchTerm || selectedDifficulty || selectedCategory || sortBy !== 'default' || showCompleted !== 'all';

  return (
    <div className="mb-8 space-y-4 animate-[fadeInUp_0.8s_ease-out]">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
          <input
            ref={searchRef}
            type="text"
            placeholder="Search questions... (Ctrl+K)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearchSubmit(searchTerm);
              }
            }}
            className="w-full pl-10 pr-4 py-3 bg-gray-800/50 dark:bg-gray-900/50 border border-gray-700/50 dark:border-gray-600/50 rounded-xl text-gray-100 dark:text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 focus:scale-[1.02] transition-all duration-300 backdrop-blur-sm"
          />
          
          {/* Search Suggestions */}
          {showSuggestions && recentSearches.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900/95 backdrop-blur-xl rounded-xl shadow-lg border border-gray-700/50 z-50">
              <div className="p-3 border-b border-gray-700/50">
                <div className="text-xs text-gray-400 flex items-center gap-2">
                  <Clock size={12} />
                  Recent Searches
                </div>
              </div>
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSearchTerm(search);
                    setShowSuggestions(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-cyan-500/20 hover:text-cyan-300 transition-colors"
                >
                  {search}
                </button>
              ))}
            </div>
          )}
        </div>
        
    
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-2 px-4 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl text-red-300 transition-all duration-300"
          >
            <X size={16} />
            Clear All
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-4">
        <div className="relative w-48">
          <Listbox value={selectedDifficulty} onChange={setSelectedDifficulty}>
            <div className="relative">
              <Listbox.Button className="w-full flex justify-between items-center px-4 py-3 bg-gray-800/50 backdrop-blur-md border border-gray-700/50 rounded-xl text-gray-100 font-medium shadow-md hover:border-cyan-400 focus:ring-2 focus:ring-cyan-500 transition-all duration-300">
                <span>{selectedDifficulty || "All Difficulties"}</span>
                <ChevronUpDownIcon className="h-5 w-5 text-cyan-400 transition-transform duration-300" />
              </Listbox.Button>
              <Listbox.Options className="absolute mt-2 w-full bg-gray-900/90 backdrop-blur-xl rounded-xl shadow-lg border border-gray-700/50 z-40">
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
              <Listbox.Options className="absolute mt-2 w-full max-h-64 overflow-y-auto bg-gray-900/90 backdrop-blur-xl rounded-xl shadow-lg border border-gray-700/50 z-40">
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
                    <div className="flex justify-between items-center">
                      <span>{category.title}</span>
                      <span className="text-xs text-gray-400">
                        {category.questionCount} questions
                      </span>
                    </div>
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </div>
          </Listbox>
        </div>

        <div className="relative w-48">
          <Listbox value={sortBy} onChange={setSortBy}>
            <div className="relative">
              <Listbox.Button className="w-full flex justify-between items-center px-4 py-3 bg-gray-800/50 backdrop-blur-md border border-gray-700/50 rounded-xl text-gray-100 font-medium shadow-md hover:border-cyan-400 focus:ring-2 focus:ring-cyan-500 transition-all duration-300">
                <div className="flex items-center gap-2">
                  <ArrowUpDown size={16} />
                  <span>{sortOptions.find(opt => opt.value === sortBy)?.label}</span>
                </div>
                <ChevronUpDownIcon className="h-5 w-5 text-cyan-400 transition-transform duration-300" />
              </Listbox.Button>
              <Listbox.Options className="absolute mt-2 w-full bg-gray-900/90 backdrop-blur-xl rounded-xl shadow-lg border border-gray-700/50 z-40">
                {sortOptions.map((option) => (
                  <Listbox.Option
                    key={option.value}
                    value={option.value}
                    className={({ active }) =>
                      `cursor-pointer select-none px-4 py-3 text-gray-100 transition ${
                        active ? "bg-cyan-500/20 text-cyan-300" : ""
                      }`
                    }
                  >
                    {option.label}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </div>
          </Listbox>
        </div>
        <div className="relative w-48">
          <Listbox value={showCompleted} onChange={setShowCompleted}>
            <div className="relative">
              <Listbox.Button className="w-full flex justify-between items-center px-4 py-3 bg-gray-800/50 backdrop-blur-md border border-gray-700/50 rounded-xl text-gray-100 font-medium shadow-md hover:border-cyan-400 focus:ring-2 focus:ring-cyan-500 transition-all duration-300">
                <div className="flex items-center gap-2">
                  <Filter size={16} />
                  <span>{completionOptions.find(opt => opt.value === showCompleted)?.label}</span>
                </div>
                <ChevronUpDownIcon className="h-5 w-5 text-cyan-400 transition-transform duration-300" />
              </Listbox.Button>
              <Listbox.Options className="absolute mt-2 w-full bg-gray-900/90 backdrop-blur-xl rounded-xl shadow-lg border border-gray-700/50 z-40">
                {completionOptions.map((option) => (
                  <Listbox.Option
                    key={option.value}
                    value={option.value}
                    className={({ active }) =>
                      `cursor-pointer select-none px-4 py-3 text-gray-100 transition ${
                        active ? "bg-cyan-500/20 text-cyan-300" : ""
                      }`
                    }
                  >
                    {option.label}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </div>
          </Listbox>
        </div>
      </div>
   
      {speechRecognition && (
        <div className="text-sm text-gray-500 bg-gray-800/30 dark:bg-gray-900/30 rounded-lg p-3 border border-gray-700/30 dark:border-gray-600/30">
          <div className="flex flex-wrap gap-4 text-xs">
            <span>Voice commands:</span>
            <code>"Search for sorting"</code>
            <code>"Show easy questions"</code>
            <code>"Toggle theme"</code>
            <code>"Bookmarks"</code>
            <code>"Progress"</code>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilters;