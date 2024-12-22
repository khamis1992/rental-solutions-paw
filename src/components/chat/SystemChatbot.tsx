import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { getDatabaseResponse } from "@/utils/chatDatabaseQueries";

interface Message {
  role: "assistant" | "user";
  content: string;
}

// Get the current origin for postMessage security
const TRUSTED_ORIGIN = window.location.origin;

export const SystemChatbot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your Rental Solutions assistant. How can I help you today?",
    },
  ]);

  // Check if Perplexity API key is configured
  const { isLoading: isCheckingKey, isError: isKeyError } = useQuery({
    queryKey: ["perplexity-api-key"],
    queryFn: async () => {
      try {
        // Add origin to request headers
        const { data, error } = await supabase.functions.invoke("check-perplexity-key", {
          headers: {
            'Origin': TRUSTED_ORIGIN
          }
        });
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Failed to check API key:', error);
        throw error;
      }
    },
    retry: 1,
    retryDelay: 1000,
    meta: {
      errorMessage: 'Chat service is currently unavailable'
    }
  });

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      // First try to get response from database
      try {
        const dbResponse = await getDatabaseResponse(message);
        if (dbResponse) {
          console.log('Using database response:', dbResponse);
          return dbResponse;
        }
      } catch (error) {
        console.error('Database query error:', error);
        // Continue to AI if database query fails
      }

      // Process messages to ensure alternation
      const processedMessages = messages.reduce((acc: Message[], curr, index) => {
        if (index === 0 || curr.role !== acc[acc.length - 1].role) {
          acc.push(curr);
        }
        return acc;
      }, []).slice(-6);

      const apiMessages = [
        ...processedMessages,
        { role: "user" as const, content: message }
      ];

      console.log('Sending messages to AI:', apiMessages);
      
      // Add origin to request headers
      const { data, error } = await supabase.functions.invoke("chat", {
        body: { 
          messages: apiMessages,
          dbResponse: null // No database response, use AI
        },
        headers: {
          'Origin': TRUSTED_ORIGIN
        }
      });
      
      if (error) throw error;
      
      if (!data?.message) {
        throw new Error('Invalid response from chat service');
      }
      
      return data.message;
    },
    onSuccess: (response, variables) => {
      setMessages((prev) => [
        ...prev,
        { role: "user", content: variables },
        { role: "assistant", content: response },
      ]);
    },
    onError: (error: Error) => {
      console.error("Chat error:", error);
      toast.error(error.message || "Failed to get response. Please try again.");
    },
  });

  const handleSendMessage = (message: string) => {
    if (isKeyError) {
      toast.error("Chat service is not properly configured. Please try again later.");
      return;
    }
    chatMutation.mutate(message);
  };

  if (isCheckingKey) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (isKeyError) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="py-10">
          <p className="text-center text-muted-foreground">
            Chat service is currently unavailable. Please try again later.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Rental Solutions Assistant</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScrollArea className="h-[400px] pr-4">
          {messages.map((message, index) => (
            <ChatMessage
              key={index}
              content={message.content}
              role={message.role}
            />
          ))}
          {chatMutation.isPending && (
            <div className="flex justify-center py-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
        </ScrollArea>

        <ChatInput
          onSend={handleSendMessage}
          disabled={chatMutation.isPending || isCheckingKey}
        />
      </CardContent>
    </Card>
  );
};