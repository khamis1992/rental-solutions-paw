import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ChatMessageProps {
  content: string;
  role: "assistant" | "user";
}

export const ChatMessage = ({ content, role }: ChatMessageProps) => {
  const [showFeedback, setShowFeedback] = useState(false);

  return (
    <div
      className={cn(
        "flex w-full gap-2 py-2",
        role === "assistant" ? "flex-row" : "flex-row-reverse"
      )}
    >
      <div
        className={cn(
          "rounded-lg px-4 py-2 max-w-[80%]",
          role === "assistant"
            ? "bg-muted text-foreground"
            : "bg-primary text-primary-foreground"
        )}
      >
        <p className="whitespace-pre-wrap">{content}</p>
        {role === "assistant" && (
          <div className="mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFeedback(!showFeedback)}
            >
              Not what you meant?
            </Button>
            {showFeedback && (
              <div className="mt-2 text-sm text-muted-foreground">
                Type: "That's not what I meant by [term]" to help me learn.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};