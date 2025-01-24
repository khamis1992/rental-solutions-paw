import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { CoordinatorAgent } from "./agents/CoordinatorAgent";
import { VehicleAgent } from "./agents/VehicleAgent";
import { PaymentAgent } from "./agents/PaymentAgent";
import { LegalAgent } from "./agents/LegalAgent";

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
  const coordinatorRef = useRef<CoordinatorAgent>(new CoordinatorAgent());

  // Initialize agents
  useEffect(() => {
    const coordinator = coordinatorRef.current;
    coordinator.registerAgent(new VehicleAgent());
    coordinator.registerAgent(new PaymentAgent());
    coordinator.registerAgent(new LegalAgent());
  }, []);

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

  // Subscribe to real-time notifications
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
      // Subscribe to maintenance notifications
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'maintenance',
          filter: `status=eq.scheduled`
        },
        (payload: any) => {
          if (payload.new && payload.new.scheduled_date) {
            const notification = `Maintenance Alert: Vehicle maintenance is scheduled for ${new Date(payload.new.scheduled_date).toLocaleDateString()}`;
            setMessages(prev => [...prev, {
              role: "assistant",
              content: notification
            }]);
          }
        }
      )
      // Subscribe to overdue payments
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'overdue_payments_view'
        },
        (payload: any) => {
          if (payload.new && payload.new.days_overdue) {
            const notification = `Payment Alert: Payment overdue for ${payload.new.days_overdue} days`;
            setMessages(prev => [...prev, {
              role: "assistant",
              content: notification
            }]);
          }
        }
      )
      // Subscribe to expiring agreements
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leases',
          filter: `status=eq.active`
        },
        (payload: any) => {
          if (payload.new && payload.new.end_date) {
            const endDate = new Date(payload.new.end_date);
            const daysUntilExpiry = Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            
            if (daysUntilExpiry <= 7) {
              const notification = `Agreement Alert: Agreement #${payload.new.agreement_number} expires in ${daysUntilExpiry} days`;
              setMessages(prev => [...prev, {
                role: "assistant",
                content: notification
              }]);
            }
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to chat updates and notifications');
        } else if (status === 'CLOSED') {
          console.log('Subscription to chat updates closed');
          toast.error('Lost connection to real-time updates');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Error in chat subscription channel');
          toast.error('Error in real-time updates connection');
        }
      });

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      try {
        // Route message through coordinator agent
        const response = await coordinatorRef.current.route(message);
        console.log('Agent response:', response);
        
        // If we have a response with good confidence, use it
        if (response.confidence > 0.5) {
          return response.content;
        }

        // Fallback to DeepSeek for low confidence or unclear queries
        const aiResponse = await fetch(`${TRUSTED_ORIGIN}/api/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [
              {
                role: 'system',
                content: 'You are a helpful assistant for a vehicle rental company. Only provide information based on the system data.'
              },
              { role: 'user', content: message }
            ]
          }),
        });

        if (!aiResponse.ok) {
          throw new Error('Failed to get AI response');
        }

        const data = await aiResponse.json();
        return data.message;
      } catch (error) {
        console.error('Chat error:', error);
        return "I encountered an error. Please try again or rephrase your question.";
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