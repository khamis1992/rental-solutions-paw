import { useState, useEffect, useRef } from "react";
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

const TRUSTED_ORIGIN = window.location.origin;

export const SystemChatbot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your Rental Solutions assistant. I can help you with information about vehicles, customers, agreements, and payments. What would you like to know?",
    },
  ]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);

  // Track user activity
  useEffect(() => {
    const trackActivity = async () => {
      await supabase
        .from('user_activity')
        .insert([{ activity_count: 1 }]);
    };

    trackActivity();
  }, []);

  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) return;

    const resizeObserver = new ResizeObserver(() => {
      scrollArea.scrollTop = scrollArea.scrollHeight;
    });

    resizeObserver.observe(scrollArea);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    channelRef.current = supabase
      .channel('chat-updates')
      .on(
        'broadcast',
        { event: 'chat-message' },
        (payload) => {
          console.log('Received real-time message:', payload);
          if (payload.message) {
            setMessages(prev => [...prev, {
              role: "assistant",
              content: payload.message
            }]);
          }
        }
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      try {
        // First, get the database response
        const dbResponse = await getDatabaseResponse(message);
        
        // If we have a direct database response, use it
        if (dbResponse) {
          console.log('Using database response:', dbResponse);
          return dbResponse;
        }

        // If no direct match, use DeepSeek to understand the query
        const response = await fetch(`${TRUSTED_ORIGIN}/functions/v1/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            messages: [
              {
                role: 'system',
                content: 'You are a helpful assistant for a vehicle rental company. Only provide information based on the system data. If you cannot find specific data, ask the user to rephrase their question to match available information categories: vehicles, customers, agreements, payments, or maintenance.'
              },
              { role: 'user', content: message }
            ],
            dbResponse: null // We already tried direct database response
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to get AI response');
        }

        const data = await response.json();
        
        // Try database response again with AI-interpreted query
        const refinedDbResponse = await getDatabaseResponse(data.message);
        return refinedDbResponse || "I can only provide information about our system data. Please ask about vehicles, customers, agreements, payments, or maintenance.";
      } catch (error) {
        console.error('Chat error:', error);
        return "I can only provide information about our system data. Please ask about vehicles, customers, agreements, payments, or maintenance.";
      }
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
      toast.error("Failed to get response. Please try again.");
    },
  });

  const handleSendMessage = (message: string) => {
    chatMutation.mutate(message);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto pt-[var(--header-height,56px)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Rental Solutions Assistant</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScrollArea 
          ref={scrollAreaRef}
          className="h-[400px] pr-4"
        >
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
          disabled={chatMutation.isPending}
        />
      </CardContent>
    </Card>
  );
};