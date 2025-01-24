import { cn } from "@/lib/utils";
import { AlertTriangle, ThumbsUp, ThumbsDown } from "lucide-react";

interface ChatMessageProps {
  content: string;
  role: "assistant" | "user";
  sentiment?: {
    score: number;
    label: string;
    urgency: string;
  };
}

export const ChatMessage = ({ content, role, sentiment }: ChatMessageProps) => {
  return (
    <div
      className={cn(
        "flex w-full gap-2 rounded-lg p-4",
        role === "assistant"
          ? "bg-muted"
          : "bg-primary text-primary-foreground"
      )}
    >
      <div className="flex-1">
        <p className="whitespace-pre-wrap">{content}</p>
        {sentiment && role === "user" && (
          <div className="flex items-center gap-2 mt-2 text-sm opacity-80">
            {sentiment.urgency === 'high' && (
              <span className="flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                Urgent
              </span>
            )}
            <span className="flex items-center gap-1">
              {sentiment.label === 'positive' ? (
                <ThumbsUp className="h-4 w-4" />
              ) : (
                <ThumbsDown className="h-4 w-4" />
              )}
              {sentiment.label}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};