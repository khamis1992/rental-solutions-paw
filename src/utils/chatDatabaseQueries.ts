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

  // Handle document analysis requests
  if (lowerMessage.includes('analyze document') || 
      lowerMessage.includes('explain document') ||
      lowerMessage.includes('document terms')) {
    
    // Get the most recently uploaded document
    const { data: documents } = await supabase
      .from('agreement_documents')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!documents) {
      return "I don't see any recently uploaded documents to analyze. Please upload a document first.";
    }

    try {
      const { data, error } = await supabase.functions.invoke('analyze-legal-document', {
        body: {
          documentUrl: documents.document_url,
          documentId: documents.id
        }
      });

      if (error) throw error;
      return data.analysis;
    } catch (error) {
      console.error('Error analyzing document:', error);
      return "I encountered an error while analyzing the document. Please try again later.";
    }
  }

  // Handle specific document queries
  if (lowerMessage.includes('what does') && 
      (lowerMessage.includes('document') || lowerMessage.includes('agreement'))) {
    
    const { data: documents } = await supabase
      .from('agreement_documents')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!documents) {
      return "I don't see any recently uploaded documents to analyze. Please upload a document first.";
    }

    try {
      const { data, error } = await supabase.functions.invoke('analyze-legal-document', {
        body: {
          documentUrl: documents.document_url,
          documentId: documents.id,
          query: message
        }
      });

      if (error) throw error;
      return data.analysis;
    } catch (error) {
      console.error('Error analyzing document:', error);
      return "I encountered an error while analyzing the document. Please try again later.";
    }
  }

  // Payment queries
  if (lowerMessage.includes('payment') || lowerMessage.includes('invoice')) {
    const { data: payments } = await supabase
      .from('payments')
      .select('*')
      .limit(5);

    if (payments?.length) {
      return `Recent payments: ${payments.map(p => 
        `${p.payment_method} - QAR ${p.amount}`
      ).join(', ')}`;
    }
  }

  // Maintenance queries
  if (lowerMessage.includes('maintenance') || lowerMessage.includes('repair')) {
    const { data: maintenance } = await supabase
      .from('maintenance_records')
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
