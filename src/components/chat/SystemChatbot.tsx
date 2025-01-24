import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";
import { getDatabaseResponse } from "@/utils/chatDatabaseQueries";
import { Input } from "@/components/ui/input";

interface Message {
  role: "assistant" | "user";
  content: string;
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

const TRUSTED_ORIGIN = window.location.origin;

export const SystemChatbot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your Rental Solutions assistant. I can help you with information about vehicles, customers, agreements, and payments. I can also analyze documents for you - just upload them and I'll help extract the important information.",
    },
  ]);
  const [uploading, setUploading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);
  const contextRef = useRef<any>(null);

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
    // Initialize conversation context
    const initContext = async () => {
      const { data: existingContext } = await supabase
        .from('conversation_contexts')
        .select('context_data')
        .single();

      if (!existingContext) {
        const { data } = await supabase
          .from('conversation_contexts')
          .insert([{ context_data: {} }])
          .select()
          .single();
        
        contextRef.current = data?.context_data || {};
      } else {
        contextRef.current = existingContext.context_data;
      }
    };

    initContext();

    channelRef.current = supabase
      .channel('chat-updates')
      .on(
        'broadcast',
        { event: 'chat-message' },
        (payload) => {
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('customer_documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('customer_documents')
        .getPublicUrl(fileName);

      // Analyze document
      const response = await fetch(`${TRUSTED_ORIGIN}/functions/v1/analyze-document`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ 
          documentUrl: publicUrl,
          documentType: fileExt 
        }),
      });

      if (!response.ok) throw new Error('Failed to analyze document');

      const analysis = await response.json();

      // Add analysis results to chat
      setMessages(prev => [
        ...prev,
        {
          role: "user",
          content: `Uploaded document: ${file.name}`,
        },
        {
          role: "assistant",
          content: `I've analyzed the document. Here's what I found:\n\n${analysis.summary}\n\n${
            analysis.isComplete 
              ? "✅ The document appears to be complete." 
              : `⚠️ The document is missing some fields: ${analysis.missingFields.join(', ')}`
          }`,
          documentAnalysis: analysis
        }
      ]);

    } catch (error: any) {
      console.error('Error processing document:', error);
      toast.error('Failed to process document');
    } finally {
      setUploading(false);
      if (event.target) event.target.value = '';
    }
  };

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      try {
        // First, analyze sentiment
        const response = await fetch(`${TRUSTED_ORIGIN}/functions/v1/analyze-sentiment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ text: message }),
        });

        const sentimentData = await response.json();
        
        // Store message with sentiment analysis
        await supabase.from('chat_messages').insert([{
          message,
          role: 'user',
          sentiment_score: sentimentData.score,
          sentiment_label: sentimentData.label,
          urgency_level: sentimentData.urgency,
          conversation_context: contextRef.current
        }]);

        // Get database response if available
        const dbResponse = await getDatabaseResponse(message);
        if (dbResponse) {
          console.log('Using database response:', dbResponse);
          return { content: dbResponse, sentiment: sentimentData };
        }

        // If no direct match, use DeepSeek with context
        const aiResponse = await fetch(`${TRUSTED_ORIGIN}/functions/v1/chat`, {
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
            context: contextRef.current,
            sentiment: sentimentData
          }),
        });

        if (!aiResponse.ok) {
          throw new Error('Failed to get AI response');
        }

        const data = await aiResponse.json();
        
        // Update conversation context
        contextRef.current = {
          ...contextRef.current,
          lastQuery: message,
          lastResponse: data.message,
          timestamp: new Date().toISOString()
        };

        await supabase
          .from('conversation_contexts')
          .update({ context_data: contextRef.current })
          .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

        return { content: data.message, sentiment: sentimentData };
      } catch (error) {
        console.error('Chat error:', error);
        return {
          content: "I can only provide information about our system data. Please ask about vehicles, customers, agreements, payments, or maintenance.",
          sentiment: null
        };
      }
    },
    onSuccess: (response, variables) => {
      setMessages((prev) => [
        ...prev,
        { role: "user", content: variables },
        { 
          role: "assistant", 
          content: response.content,
          sentiment: response.sentiment 
        },
      ]);

      // Show urgent message notification if detected
      if (response.sentiment?.urgency === 'high') {
        toast.warning("This query has been marked as urgent and will be prioritized.");
      }
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
              sentiment={message.sentiment}
              documentAnalysis={message.documentAnalysis}
            />
          ))}
          {chatMutation.isPending && (
            <div className="flex justify-center py-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
        </ScrollArea>

        <div className="space-y-2">
          <Input
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileUpload}
            disabled={uploading}
            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
          />
          {uploading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing document...
            </div>
          )}
        </div>

        <ChatInput
          onSend={handleSendMessage}
          disabled={chatMutation.isPending}
        />
      </CardContent>
    </Card>
  );
};