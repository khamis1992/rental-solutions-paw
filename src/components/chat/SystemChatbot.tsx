import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  role: "assistant" | "user";
  content: string;
}

export const SystemChatbot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your Rental Solutions assistant. How can I help you today?",
    },
  ]);

  const { isLoading: isLoadingKey } = useQuery({
    queryKey: ["openai-api-key"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("check-openai-key");
      if (error) throw error;
      return data;
    },
  });

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      console.log('Sending message:', message);
      const { data, error } = await supabase.functions.invoke("chat", {
        body: { messages: [...messages, { role: "user", content: message }] },
      });
      
      if (error) {
        console.error('Chat error:', error);
        throw error;
      }
      console.log('Received response:', data);
      return data.message;
    },
    onSuccess: (response, variables) => {
      setMessages((prev) => [
        ...prev,
        { role: "user", content: variables },
        { role: "assistant", content: response },
      ]);
    },
    onError: (error) => {
      console.error("Chat error:", error);
      toast.error("Failed to get response. Please try again.");
    },
  });

  const handleSendMessage = (message: string) => {
    chatMutation.mutate(message);
  };

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
        </ScrollArea>

        <ChatInput
          onSend={handleSendMessage}
          disabled={chatMutation.isPending || isLoadingKey}
        />
      </CardContent>
    </Card>
  );
};