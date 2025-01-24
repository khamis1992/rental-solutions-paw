import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { AlertCircle, FileText, CheckCircle, XCircle } from "lucide-react";

interface ChatMessageProps {
  content: string;
  role: "assistant" | "user";
  sentiment?: {
    score: number;
    label: string;
    urgency: string;
  };
  documentAnalysis?: {
    documentType: string;
    classification: string;
    extractedData: any;
    isComplete: boolean;
    missingFields: string[];
    summary: string;
    confidence: number;
  };
}

export const ChatMessage = ({ content, role, sentiment, documentAnalysis }: ChatMessageProps) => {
  return (
    <div
      className={cn(
        "flex w-full mb-4",
        role === "assistant" ? "justify-start" : "justify-end"
      )}
    >
      <Card
        className={cn(
          "max-w-[80%] p-4",
          role === "assistant"
            ? "bg-muted"
            : "bg-primary text-primary-foreground"
        )}
      >
        <div className="space-y-2">
          <p className="text-sm whitespace-pre-wrap">{content}</p>
          
          {sentiment?.urgency === "high" && (
            <div className="flex items-center gap-2 text-destructive text-xs mt-2">
              <AlertCircle className="h-4 w-4" />
              <span>High Priority Message</span>
            </div>
          )}

          {documentAnalysis && (
            <div className="mt-4 space-y-3 border-t pt-3">
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4" />
                <span>Document Type: {documentAnalysis.documentType}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                {documentAnalysis.isComplete ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-destructive" />
                )}
                <span>
                  {documentAnalysis.isComplete 
                    ? "Document is complete" 
                    : "Document is incomplete"}
                </span>
              </div>

              {documentAnalysis.missingFields.length > 0 && (
                <div className="text-sm text-destructive">
                  Missing fields:
                  <ul className="list-disc ml-4">
                    {documentAnalysis.missingFields.map((field, index) => (
                      <li key={index}>{field}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="text-xs text-muted-foreground">
                Confidence Score: {Math.round(documentAnalysis.confidence * 100)}%
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};