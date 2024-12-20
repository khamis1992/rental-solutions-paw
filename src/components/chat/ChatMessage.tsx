import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  content: string;
  role: "assistant" | "user";
}

export const ChatMessage = ({ content, role }: ChatMessageProps) => {
  const isAssistant = role === "assistant";

  return (
    <div className={cn("flex gap-3 mb-4", isAssistant ? "flex-row" : "flex-row-reverse")}>
      <Avatar className="h-8 w-8">
        {isAssistant ? (
          <>
            <AvatarImage src="/lovable-uploads/5ff2d160-bf38-4dbe-ab65-223663cc86b2.png" />
            <AvatarFallback>AI</AvatarFallback>
          </>
        ) : (
          <>
            <AvatarFallback>U</AvatarFallback>
          </>
        )}
      </Avatar>
      <div
        className={cn(
          "rounded-lg px-4 py-2 max-w-[80%]",
          isAssistant
            ? "bg-secondary text-secondary-foreground"
            : "bg-primary text-primary-foreground"
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
};