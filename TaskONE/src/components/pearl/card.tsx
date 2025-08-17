import  { useState } from 'react';
import { 
  CheckCircle, 
  Bookmark, 
  BookmarkCheck, 
  Play, 
  ExternalLink, 
  BookOpen, 
  Eye,
  Clock,
  Calendar
} from 'lucide-react';

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

interface QuestionCardProps {
  question: Question;
  qIndex: number;
  isSelected?: boolean;
  onToggleProgress: (questionId: string) => void;
  onToggleBookmark: (questionId: string) => void;
  onToggleSelect?: (questionId: string) => void;
  showBulkActions?: boolean;
  onShowDetails?: (question: Question) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  qIndex,
  isSelected = false,
  onToggleProgress,
  onToggleBookmark,
  onToggleSelect,
  showBulkActions = false,
  onShowDetails
}) => {
  const [showHint, setShowHint] = useState(false);

  const getDifficultyClasses = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-600/90 text-white border border-green-500/60 px-3 py-1 rounded-full text-xs font-medium';
      case 'Medium': return 'bg-amber-600/90 text-white border border-amber-500/60 px-3 py-1 rounded-full text-xs font-medium';
      case 'Hard': return 'bg-red-600/90 text-white border border-red-500/60 px-3 py-1 rounded-full text-xs font-medium';
      default: return 'bg-gray-600/90 text-white border border-gray-500/60 px-3 py-1 rounded-full text-xs font-medium';
    }
  };

  const formatTimeSpent = (seconds?: number) => {
    if (!seconds) return null;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const formatLastAttempted = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div
      className={`p-6 hover:bg-gray-700/30 dark:hover:bg-gray-800/30 transition-all duration-300 ${
        isSelected ? 'bg-cyan-500/10 border-l-4 border-cyan-500' : ''
      }`}
      style={{ animationDelay: `${qIndex * 50}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">

            {showBulkActions && onToggleSelect && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggleSelect(question.id)}
                className="w-4 h-4 text-cyan-600 bg-gray-800 border-gray-600 rounded focus:ring-cyan-500 focus:ring-2"
              />
            )}
            
            <span className="text-sm font-mono text-gray-500 dark:text-gray-400">
              #{question.questionId}
            </span>
            <span className={getDifficultyClasses(question.difficulty)}>
              {question.difficulty}
            </span>
            {question.isCompleted && (
              <CheckCircle size={16} className="text-green-400" />
            )}
            
            {question.timeSpent && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock size={12} />
                <span>{formatTimeSpent(question.timeSpent)}</span>
              </div>
            )}
            
            {question.lastAttempted && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar size={12} />
                <span>{formatLastAttempted(question.lastAttempted)}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <h3 
                className="text-lg font-medium text-gray-100 dark:text-gray-200 mb-2 cursor-pointer hover:text-cyan-400 transition-colors"
                onClick={() => onShowDetails?.(question)}
              >
                {question.title}
              </h3>
              
              {question.description && (
                <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                  {question.description.substring(0, 120)}...
                </p>
              )}
              
              {question.tags && question.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {question.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="px-2 py-1 text-xs bg-gray-700/50 dark:bg-gray-600/50 text-gray-300 dark:text-gray-400 rounded-md border border-gray-600/50 dark:border-gray-500/50 hover:bg-gray-600/50 transition-colors cursor-pointer"
                      title={`Filter by ${tag}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

 
              {question.hints && question.hints.length > 0 && (
                <div className="mb-3">
                  <button
                    onClick={() => setShowHint(!showHint)}
                    className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    {showHint ? 'Hide Hint' : 'Show Hint'} ({question.hints.length})
                  </button>
                  {showHint && (
                    <div className="mt-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <p className="text-sm text-yellow-300">
                        💡 {question.hints[0]}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          {onShowDetails && (
            <button
              onClick={() => onShowDetails(question)}
              className="p-2 text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all duration-300"
              title="View details"
            >
              <Eye size={16} />
            </button>
          )}

          <button
            onClick={() => onToggleProgress(question.id)}
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
            onClick={() => onToggleBookmark(question.id)}
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
};

export default QuestionCard;