import { useState } from 'react';
import { X, CheckCircle,Play, ExternalLink, BookOpen, Clock, Calendar, Tag, Trophy, Star } from 'lucide-react';

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
  solution?: string;
  difficulty_rating?: number;
  acceptance_rate?: number;
}

interface QuestionModalProps {
  question: Question | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleProgress: (questionId: string) => void;
  onToggleBookmark: (questionId: string) => void;
}

const QuestionModal: React.FC<QuestionModalProps> = ({
  question,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'description' | 'hints' | 'solution'>('description');
  const [showSolution, setShowSolution] = useState(false);

  if (!isOpen || !question) return null;

  const getDifficultyClasses = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-600/90 text-white border border-green-500/60';
      case 'Medium': return 'bg-amber-600/90 text-white border border-amber-500/60';
      case 'Hard': return 'bg-red-600/90 text-white border border-red-500/60';
      default: return 'bg-gray-600/90 text-white border border-gray-500/60';
    }
  };

  const formatTimeSpent = (seconds?: number) => {
    if (!seconds) return 'Not tracked';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const formatLastAttempted = (dateString?: string) => {
    if (!dateString) return 'Never attempted';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-gray-900/95 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-gray-700/50 w-full max-w-sm sm:max-w-2xl lg:max-w-4xl xl:max-w-5xl h-[95vh] sm:max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-3 sm:p-4 lg:p-6 border-b border-gray-700/50">
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
            <span className="text-sm sm:text-lg font-mono text-gray-400 truncate">#{question.questionId}</span>
            <span className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium ${getDifficultyClasses(question.difficulty)}`}>
              {question.difficulty}
            </span>
            {question.isCompleted && (
              <div className="hidden sm:flex items-center gap-2 text-green-400">
                <CheckCircle size={16} />
                <span className="text-sm">Completed</span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 rounded-lg transition-all duration-200 flex-shrink-0"
          >
            <X size={20} />
          </button>
        </div>


        <div className="flex flex-col xl:flex-row h-[calc(95vh-60px)] sm:h-[calc(90vh-80px)] lg:h-[calc(90vh-120px)]">
          <div className="flex-1 overflow-y-auto">
            <div className="p-3 sm:p-4 lg:p-6">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-100 mb-3 sm:mb-4 leading-tight">{question.title}</h1>

              {question.isCompleted && (
                <div className="flex sm:hidden items-center gap-2 text-green-400 mb-3">
                  <CheckCircle size={16} />
                  <span className="text-sm">Completed</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-2 sm:gap-4 mb-4 sm:mb-6 text-xs sm:text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Clock size={14}  />
                  <span>{formatTimeSpent(question.timeSpent)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={14}/>
                  <span>{formatLastAttempted(question.lastAttempted)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag size={14} />
                  <span>{question.category.title}</span>
                </div>
                {question.acceptance_rate && (
                  <div className="flex items-center gap-2">
                    <Trophy size={14} />
                    <span>{question.acceptance_rate}% acceptance</span>
                  </div>
                )}
                {question.difficulty_rating && (
                  <div className="flex items-center gap-2">
                    <Star size={14}  />
                    <span>{question.difficulty_rating}/5 difficulty</span>
                  </div>
                )}
              </div>

              <div className="flex space-x-1 mb-4 sm:mb-6 bg-gray-800/30 rounded-lg p-1 overflow-x-auto">
                {[
                  { id: 'description', label: 'Description', shortLabel: 'Desc' },
                  { id: 'hints', label: `Hints (${question.hints?.length || 0})`, shortLabel: `Hints (${question.hints?.length || 0})` },
                  { id: 'solution', label: 'Solution', shortLabel: 'Solution' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-3 py-2 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/30'
                    }`}
                  >
                    <span className="sm:hidden">{tab.shortLabel}</span>
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>

              <div className="prose prose-invert max-w-none">
                {activeTab === 'description' && (
                  <div>
                    <div className="text-gray-300 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">
                      {question.description || 'No description available for this question.'}
                    </div>
                    
                    {question.tags && question.tags.length > 0 && (
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-200 mb-3">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                          {question.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 sm:px-3 sm:py-1 bg-gray-700/50 text-gray-300 rounded-md border border-gray-600/50 text-xs sm:text-sm"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'hints' && (
                  <div>
                    {question.hints && question.hints.length > 0 ? (
                      <div className="space-y-3 sm:space-y-4">
                        {question.hints.map((hint, index) => (
                          <div key={index} className="p-3 sm:p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                            <div className="flex items-start gap-3">
                              <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-yellow-500/20 text-yellow-300 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold">
                                {index + 1}
                              </span>
                              <p className="text-yellow-200 text-xs sm:text-sm leading-relaxed">{hint}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 sm:py-8 text-gray-500 text-sm sm:text-base">
                        No hints available for this question.
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'solution' && (
                  <div>
                    {!showSolution ? (
                      <div className="text-center py-6 sm:py-8">
                        <div className="text-gray-400 mb-4 text-sm sm:text-base">
                          Are you sure you want to view the solution?
                        </div>
                        <button
                          onClick={() => setShowSolution(true)}
                          className="px-4 py-2 sm:px-6 sm:py-3 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 rounded-lg text-orange-300 transition-all duration-200 text-sm sm:text-base"
                        >
                          Show Solution
                        </button>
                      </div>
                    ) : (
                      <div className="p-3 sm:p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                        <div className="text-orange-200 leading-relaxed text-sm sm:text-base">
                          {question.solution || 'Solution not available for this question.'}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="xl:w-80 border-t xl:border-t-0 xl:border-l border-gray-700/50 p-3 sm:p-4 lg:p-6 bg-gray-800/30">
            <h3 className="text-base sm:text-lg font-semibold text-gray-200 mb-3 sm:mb-4">Actions</h3>
            
            <div className="grid grid-cols-2 xl:grid-cols-1 gap-2 sm:gap-3">
              
      

              {question.ytLink && (
                <a
                  href={question.ytLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 sm:gap-3 px-3 py-2 sm:px-4 sm:py-3 bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30 rounded-lg transition-all duration-200 text-xs sm:text-sm"
                >
                  <Play size={16}  />
                  <span className="hidden sm:inline">Watch Video</span>
                  <span className="sm:hidden">Video</span>
                </a>
              )}

              {question.p1Link && (
                <a
                  href={question.p1Link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 sm:gap-3 px-3 py-2 sm:px-4 sm:py-3 bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-lg transition-all duration-200 text-xs sm:text-sm"
                >
                  <ExternalLink size={16}  />
                  <span className="hidden sm:inline">Problem Link 1</span>
                  <span className="sm:hidden">Link 1</span>
                </a>
              )}

              {question.p2Link && (
                <a
                  href={question.p2Link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 sm:gap-3 px-3 py-2 sm:px-4 sm:py-3 bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg transition-all duration-200 text-xs sm:text-sm"
                >
                  <BookOpen size={16}  />
                  <span className="hidden sm:inline">Problem Link 2</span>
                  <span className="sm:hidden">Link 2</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionModal;