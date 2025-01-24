import { supabase } from "@/integrations/supabase/client";

export async function getDatabaseResponse(message: string): Promise<string | null> {
  const lowerMessage = message.toLowerCase();

  // Help Center Integration
  const helpMatch = lowerMessage.match(/how to|help with|guide for|tutorial/i);
  if (helpMatch) {
    const { data: guides } = await supabase
      .from('help_guides')
      .select(`
        *,
        category:help_guide_categories(name)
      `)
      .textSearch('title', message.replace(/how to|help with|guide for|tutorial/gi, '').trim())
      .limit(3);

    if (guides?.length) {
      return `Here are some relevant guides that might help:\n\n${
        guides.map(g => 
          `📚 ${g.title}\nCategory: ${g.category?.name}\n${g.steps ? 
            `Steps:\n${JSON.parse(g.steps.toString()).join('\n')}\n` : ''
          }`
        ).join('\n\n')
      }`;
    }
  }

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
  if (lowerMessage.includes('available vehicles') || lowerMessage.includes('show vehicles')) {
    const { data: vehicles } = await supabase
      .from('vehicles')
      .select('*')
      .eq('status', 'available')
      .limit(5);

    if (vehicles?.length) {
      return `Here are some available vehicles:\n${vehicles.map(v => 
        `${v.make} ${v.model} (${v.year}) - License Plate: ${v.license_plate}`
      ).join('\n')}`;
    }
  }

  // Vehicle maintenance history
  const maintenanceMatch = lowerMessage.match(/maintenance.*for.*([A-Z0-9-]+)/i);
  if (maintenanceMatch) {
    const licensePlate = maintenanceMatch[1];
    const { data: maintenance } = await supabase
      .from('maintenance')
      .select(`
        *,
        vehicles!inner(license_plate)
      `)
      .eq('vehicles.license_plate', licensePlate)
      .order('created_at', { ascending: false })
      .limit(5);

    if (maintenance?.length) {
      return `Maintenance history for vehicle ${licensePlate}:\n${
        maintenance.map(m => 
          `- ${m.service_type} (${m.status}) on ${new Date(m.created_at).toLocaleDateString()}`
        ).join('\n')
      }`;
    }
  }

  // Invoice details
  const invoiceMatch = lowerMessage.match(/invoice.*#?(\d+)/i);
  if (invoiceMatch) {
    const invoiceNumber = invoiceMatch[1];
    const { data: invoice } = await supabase
      .from('accounting_invoices')
      .select(`
        *,
        customer:profiles(full_name)
      `)
      .eq('invoice_number', `INV-${invoiceNumber}`)
      .single();

    if (invoice) {
      return `Invoice #${invoice.invoice_number} details:\n` +
        `Customer: ${invoice.customer?.full_name}\n` +
        `Amount: ${invoice.amount} QAR\n` +
        `Status: ${invoice.status}\n` +
        `Due Date: ${new Date(invoice.due_date).toLocaleDateString()}`;
    }
  }

  // Legal case status
  const caseMatch = lowerMessage.match(/case.*#?(\d+)/i);
  if (caseMatch) {
    const caseId = caseMatch[1];
    const { data: legalCase } = await supabase
      .from('legal_cases')
      .select(`
        *,
        customer:profiles(full_name)
      `)
      .eq('id', caseId)
      .single();

    if (legalCase) {
      return `Legal Case #${caseId} status:\n` +
        `Customer: ${legalCase.customer?.full_name}\n` +
        `Type: ${legalCase.case_type}\n` +
        `Status: ${legalCase.status}\n` +
        `Priority: ${legalCase.priority}`;
    }
  }

  // Traffic fine guidance
  if (lowerMessage.includes('dispute') && lowerMessage.includes('fine')) {
    return `To dispute a traffic fine, please follow these steps:\n` +
      `1. Gather all relevant documentation (photos, witness statements)\n` +
      `2. Fill out the dispute form available at our office\n` +
      `3. Submit the form along with evidence within 30 days of receiving the fine\n` +
      `4. You will be notified of the decision within 14 business days\n\n` +
      `For more information, contact our legal department at legal@rentalsolutions.com`;
  }

  // Payment status queries
  if (lowerMessage.includes('payment') || lowerMessage.includes('balance')) {
    const agreementMatch = lowerMessage.match(/agreement.*#?([A-Z0-9-]+)/i);
    if (agreementMatch) {
      const agreementNumber = agreementMatch[1];
      const { data: payments } = await supabase
        .from('unified_payments')
        .select(`
          *,
          lease:leases!inner(
            agreement_number,
            customer:profiles(full_name)
          )
        `)
        .eq('lease.agreement_number', agreementNumber)
        .order('created_at', { ascending: false })
        .limit(5);

      if (payments?.length) {
        const totalPaid = payments.reduce((sum, p) => sum + (p.amount_paid || 0), 0);
        const totalBalance = payments.reduce((sum, p) => sum + (p.balance || 0), 0);
        
        return `Payment status for Agreement #${agreementNumber}:\n` +
          `Customer: ${payments[0].lease.customer.full_name}\n` +
          `Total Paid: ${totalPaid} QAR\n` +
          `Outstanding Balance: ${totalBalance} QAR\n\n` +
          `Recent Payments:\n${
            payments.map(p => 
              `- ${new Date(p.payment_date).toLocaleDateString()}: ${p.amount_paid} QAR (${p.status})`
            ).join('\n')
          }`;
      }
    }
  }

  // Proactive Support Suggestions
  const { data: userActivity } = await supabase
    .from('user_activity')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(5);

  if (userActivity?.length) {
    const activityCount = userActivity[0]?.activity_count || 0;
    
    if (activityCount > 3) {
      return `I notice you've been working on this task for a while. Here are some helpful resources:\n\n` +
        `📚 Check our Help Center for detailed guides\n` +
        `🎯 Use quick filters to find what you need faster\n` +
        `💡 Try our new search feature for faster navigation\n\n` +
        `Can I help you find anything specific?`;
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
  if (lowerMessage.includes('case') || lowerMessage.includes('legal') || lowerMessage.includes('fine')) {
    return 'legal management';
  }
  if (lowerMessage.includes('customer') || lowerMessage.includes('client')) {
    return 'customer relations';
  }
  
  return 'general rental business';
}