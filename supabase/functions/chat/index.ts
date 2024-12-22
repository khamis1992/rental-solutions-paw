import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';

const systemPrompt = `You are an AI assistant for the Rental Solutions vehicle rental management system. You have deep knowledge of both the system's features and real-time data:

Key Features & Data Access:
1. Vehicle Management
   - Track fleet inventory, vehicle status, maintenance schedules
   - Access to vehicle details including make, model, year, status
   - Monitor real-time vehicle sensor data and maintenance history

2. Customer Management
   - Customer profiles with document verification
   - Credit assessments and risk analysis
   - Payment history and rental preferences

3. Rental Agreements
   - Contract creation and management
   - Payment tracking and invoicing
   - Document management and verification

4. Financial Management
   - Revenue tracking and expense management
   - Payment reconciliation
   - Financial forecasting and insights

5. Maintenance System
   - Service scheduling and tracking
   - Predictive maintenance recommendations
   - Job cards and service history

6. Traffic Fines
   - Fine management and assignment
   - Payment tracking
   - Violation history

I can help users by:
1. Explaining any system feature or workflow
2. Providing real-time data insights
3. Troubleshooting issues
4. Suggesting best practices
5. Guiding through complex processes
`;

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

function validateAndProcessMessages(messages: ChatMessage[]): ChatMessage[] {
  // Start with system message
  const processedMessages: ChatMessage[] = [
    { role: "system", content: systemPrompt }
  ];

  let lastRole: "system" | "user" | "assistant" = "system";
  
  // Process each message to ensure alternation
  for (const msg of messages) {
    // Skip messages that would create consecutive same roles
    if (msg.role === lastRole) {
      console.log(`Skipping message due to consecutive ${msg.role} roles`);
      continue;
    }
    
    processedMessages.push({
      role: msg.role,
      content: msg.content
    });
    
    lastRole = msg.role;
  }

  // Ensure the last message is from user
  if (processedMessages[processedMessages.length - 1].role !== 'user') {
    throw new Error('Last message must be from user');
  }

  return processedMessages;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { messages, dbResponse } = await req.json();
    console.log('Received messages:', messages);
    console.log('Database response:', dbResponse);

    // If we have a database response, use it instead of calling Perplexity
    if (dbResponse) {
      return new Response(
        JSON.stringify({ message: dbResponse }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get Perplexity API key from secrets
    const perplexityKey = Deno.env.get('PERPLEXITY_API_KEY');
    if (!perplexityKey) {
      throw new Error('Chat service is not properly configured');
    }

    // Process and validate messages
    const formattedMessages = validateAndProcessMessages(messages);
    console.log('Processed messages for Perplexity API:', formattedMessages);

    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${perplexityKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-large-128k-online',
          messages: formattedMessages,
          temperature: 0.2,
          max_tokens: 1000,
          top_p: 0.9,
          frequency_penalty: 1,
          presence_penalty: 0
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Perplexity API error:', errorData);
        throw new Error(`Perplexity API error: ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      console.log('Perplexity API response:', data);

      if (!data.choices?.[0]?.message?.content) {
        throw new Error('Invalid response format from chat service');
      }

      return new Response(
        JSON.stringify({ message: data.choices[0].message.content }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    } catch (apiError) {
      console.error('API request error:', apiError);
      throw new Error(`Failed to communicate with Perplexity API: ${apiError.message}`);
    }
  } catch (error) {
    console.error('Chat error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});