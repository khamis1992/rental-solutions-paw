import { supabase } from "@/integrations/supabase/client";

export async function getDatabaseResponse(message: string): Promise<string | null> {
  const lowerMessage = message.toLowerCase();

  // Check if this is a DeepThink request
  if (lowerMessage.includes('analyze') || 
      lowerMessage.includes('think') || 
      lowerMessage.includes('solve') ||
      lowerMessage.includes('help me with')) {
    try {
      const { data, error } = await supabase.functions.invoke('deep-think', {
        body: {
          messages: [{ role: 'user', content: message }],
          context: determineContext(message)
        }
      });

      if (error) throw error;
      return data.message;
    } catch (error) {
      console.error('Error in deep think analysis:', error);
      return "I encountered an error while analyzing your request. Please try again with more specific details.";
    }
  }

  // Vehicle queries
  if (lowerMessage.includes('vehicle') || lowerMessage.includes('car')) {
    const { data: vehicles } = await supabase
      .from('vehicles')
      .select('*')
      .limit(5);

    if (vehicles?.length) {
      return `Here are some vehicles in our fleet: ${vehicles.map(v => 
        `${v.make} ${v.model} (${v.year})`
      ).join(', ')}`;
    }
  }

  // Customer queries
  if (lowerMessage.includes('customer') || lowerMessage.includes('client')) {
    const { data: customers } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);

    if (customers?.length) {
      return `We have ${customers.length} registered customers. Here are some recent ones: ${
        customers.map(c => c.full_name).join(', ')
      }`;
    }
  }

  // Agreement queries
  if (lowerMessage.includes('agreement') || lowerMessage.includes('lease')) {
    const { data: agreements } = await supabase
      .from('leases')
      .select('*')
      .limit(5);

    if (agreements?.length) {
      return `We have ${agreements.length} active agreements. Recent agreement numbers: ${
        agreements.map(a => a.agreement_number).join(', ')
      }`;
    }
  }

  // Maintenance queries
  if (lowerMessage.includes('maintenance') || lowerMessage.includes('repair')) {
    const { data: maintenance } = await supabase
      .from('maintenance')
      .select('*')
      .limit(5);

    if (maintenance?.length) {
      return `Recent maintenance records: ${maintenance.map(m => 
        `${m.service_type} - ${m.status}`
      ).join(', ')}`;
    }
  }

  return null;
}

function determineContext(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('vehicle') || lowerMessage.includes('car') || lowerMessage.includes('maintenance')) {
    return 'vehicle management';
  }
  if (lowerMessage.includes('payment') || lowerMessage.includes('invoice') || lowerMessage.includes('finance')) {
    return 'financial operations';
  }
  if (lowerMessage.includes('customer') || lowerMessage.includes('client')) {
    return 'customer relations';
  }
  if (lowerMessage.includes('agreement') || lowerMessage.includes('contract')) {
    return 'agreement management';
  }
  
  return 'general rental business';
}