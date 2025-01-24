import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Upload } from "lucide-react";
import { useState } from "react";
import { handleChatDocumentUpload } from "@/utils/chatDatabaseQueries";

interface ChatMessageProps {
  content: string;
  role: "assistant" | "user";
  onDocumentAnalyzed?: (summary: string) => void;
}

export const ChatMessage = ({ content, role, onDocumentAnalyzed }: ChatMessageProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const isAssistant = role === "assistant";

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const summary = await handleChatDocumentUpload(
        file,
        "current-user-id", // This should be replaced with actual user ID
        "chat_upload"
      );
      
      if (summary && onDocumentAnalyzed) {
        onDocumentAnalyzed(summary);
      }
    } finally {
      setIsUploading(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

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
            ? "bg-secondary/90 text-white"
            : "bg-primary text-white"
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{content}</p>
        {isAssistant && content.includes("upload") && (
          <div className="mt-2">
            <Input
              type="file"
              onChange={handleFileUpload}
              disabled={isUploading}
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
            {isUploading && (
              <p className="text-xs mt-1 text-gray-300">Uploading and analyzing document...</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};