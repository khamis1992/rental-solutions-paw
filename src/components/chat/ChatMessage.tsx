import { cn } from "@/lib/utils";

interface ChatMessageProps {
  content: string;
  role: "assistant" | "user";
}

export const ChatMessage = ({ content, role }: ChatMessageProps) => {
  return (
    <div
      className={cn(
        "flex w-full items-start gap-2 rounded-lg p-4",
        role === "assistant" ? "bg-primary/10" : "bg-muted"
      )}
    >
      <p className={cn(
        "text-sm",
        role === "assistant" ? "text-white" : "text-foreground"
      )}>
        {content}
      </p>
    </div>
  );
};