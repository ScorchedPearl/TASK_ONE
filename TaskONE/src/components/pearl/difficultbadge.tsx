import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Difficulty = "easy" | "medium" | "hard";

interface DifficultyBadgeProps {
  difficulty: Difficulty;
  className?: string;
}

export const DifficultyBadge = ({ difficulty, className }: DifficultyBadgeProps) => {
  const getDifficultyClass = (diff: Difficulty) => {
    switch (diff) {
      case "easy":
        return "difficulty-easy";
      case "medium":
        return "difficulty-medium";
      case "hard":
        return "difficulty-hard";
      default:
        return "";
    }
  };

  const getDifficultyText = (diff: Difficulty) => {
    return diff.charAt(0).toUpperCase() + diff.slice(1);
  };

  return (
    <Badge 
      className={cn(
        "px-3 py-1 text-xs font-bold rounded-full",
        getDifficultyClass(difficulty),
        className
      )}
    >
      {getDifficultyText(difficulty)}
    </Badge>
  );
};