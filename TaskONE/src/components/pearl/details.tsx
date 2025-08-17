import { useState } from 'react';
import { X, CheckCircle, Bookmark, BookmarkCheck, Play, ExternalLink, BookOpen, Clock, Calendar, Tag, Trophy, Star } from 'lucide-react';

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
  onToggleProgress,
  onToggleBookmark
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-gray-700/50 max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <div className="flex items-center space-x-4">
            <span className="text-lg font-mono text-gray-400">#{question.questionId}</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyClasses(question.difficulty)}`}>
              {question.difficulty}
            </span>
            {question.isCompleted && (
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle size={16} />
                <span className="text-sm">Completed</span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 rounded-lg transition-all duration-200"
          >
            <X size={20} />
          </button>
        </div>


        <div className="flex flex-col lg:flex-row h-[calc(90vh-120px)]">

          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-100 mb-4">{question.title}</h1>
              

              <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  <span>{formatTimeSpent(question.timeSpent)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>{formatLastAttempted(question.lastAttempted)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag size={16} />
                  <span>{question.category.title}</span>
                </div>
                {question.acceptance_rate && (
                  <div className="flex items-center gap-2">
                    <Trophy size={16} />
                    <span>{question.acceptance_rate}% acceptance</span>
                  </div>
                )}
                {question.difficulty_rating && (
                  <div className="flex items-center gap-2">
                    <Star size={16} />
                    <span>{question.difficulty_rating}/5 difficulty</span>
                  </div>
                )}
              </div>

     
              <div className="flex space-x-1 mb-6 bg-gray-800/30 rounded-lg p-1">
                {[
                  { id: 'description', label: 'Description' },
                  { id: 'hints', label: `Hints (${question.hints?.length || 0})` },
                  { id: 'solution', label: 'Solution' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/30'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

        
              <div className="prose prose-invert max-w-none">
                {activeTab === 'description' && (
                  <div>
                    <div className="text-gray-300 leading-relaxed mb-6">
                      {question.description || 'No description available for this question.'}
                    </div>
                    
                    {question.tags && question.tags.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-200 mb-3">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                          {question.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-gray-700/50 text-gray-300 rounded-md border border-gray-600/50 text-sm"
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
                      <div className="space-y-4">
                        {question.hints.map((hint, index) => (
                          <div key={index} className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                            <div className="flex items-start gap-3">
                              <span className="flex-shrink-0 w-6 h-6 bg-yellow-500/20 text-yellow-300 rounded-full flex items-center justify-center text-sm font-bold">
                                {index + 1}
                              </span>
                              <p className="text-yellow-200 text-sm leading-relaxed">{hint}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No hints available for this question.
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'solution' && (
                  <div>
                    {!showSolution ? (
                      <div className="text-center py-8">
                        <div className="text-gray-400 mb-4">
                          Are you sure you want to view the solution?
                        </div>
                        <button
                          onClick={() => setShowSolution(true)}
                          className="px-6 py-3 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 rounded-lg text-orange-300 transition-all duration-200"
                        >
                          Show Solution
                        </button>
                      </div>
                    ) : (
                      <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                        <div className="text-orange-200 leading-relaxed">
                          {question.solution || 'Solution not available for this question.'}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

    
          <div className="lg:w-80 border-t lg:border-t-0 lg:border-l border-gray-700/50 p-6 bg-gray-800/30">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">Actions</h3>
            
            <div className="space-y-3">
              <button
                onClick={() => onToggleProgress(question.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  question.isCompleted
                    ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-green-500/20 hover:text-green-300 border border-gray-600/50'
                }`}
              >
                <CheckCircle size={20} />
                <span>{question.isCompleted ? 'Mark Incomplete' : 'Mark Complete'}</span>
              </button>

              <button
                onClick={() => onToggleBookmark(question.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  question.isBookmarked
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-blue-500/20 hover:text-blue-300 border border-gray-600/50'
                }`}
              >
                {question.isBookmarked ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
                <span>{question.isBookmarked ? 'Remove Bookmark' : 'Add Bookmark'}</span>
              </button>

              {question.ytLink && (
                <a
                  href={question.ytLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-3 px-4 py-3 bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30 rounded-lg transition-all duration-200"
                >
                  <Play size={20} />
                  <span>Watch Video</span>
                </a>
              )}

              {question.p1Link && (
                <a
                  href={question.p1Link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-3 px-4 py-3 bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-lg transition-all duration-200"
                >
                  <ExternalLink size={20} />
                  <span>Problem Link 1</span>
                </a>
              )}

              {question.p2Link && (
                <a
                  href={question.p2Link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-3 px-4 py-3 bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg transition-all duration-200"
                >
                  <BookOpen size={20} />
                  <span>Problem Link 2</span>
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