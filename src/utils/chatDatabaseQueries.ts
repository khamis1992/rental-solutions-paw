import { supabase } from "@/integrations/supabase/client";
import { normalizeQuery } from "./chatSynonyms";

export async function getDatabaseResponse(message: string): Promise<string | null> {
  const normalizedMessage = normalizeQuery(message);
  const lowerMessage = message.toLowerCase();

  // Vehicle count queries
  if (normalizedMessage.match(/how many vehicle|vehicle count|total vehicle/i)) {
    const { data: vehicles, error } = await supabase
      .from('vehicles')
      .select('status', { count: 'exact' });

    if (error) {
      console.error('Error fetching vehicle count:', error);
      return "I encountered an error while fetching vehicle information.";
    }

    const count = vehicles?.length || 0;
    return `We currently have ${count} vehicles in our fleet.`;
  }

  // Available vehicles query
  if (normalizedMessage.match(/available vehicle|show vehicle/i)) {
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

  // Agreement Generation Command
  const agreementMatch = lowerMessage.match(/create.*(rental|lease).*(agreement|contract)\s+for\s+(.+)/i);
  if (agreementMatch) {
    const customerName = agreementMatch[3].trim();
    try {
      // Find customer
      const { data: customer } = await supabase
        .from('profiles')
        .select('id, full_name')
        .ilike('full_name', `%${customerName}%`)
        .single();

      if (!customer) {
        return `Customer "${customerName}" not found. Please verify the name and try again.`;
      }

      // Get default agreement template
      const { data: template } = await supabase
        .from('agreement_templates')
        .select('*')
        .eq('is_active', true)
        .eq('agreement_type', 'short_term')
        .single();

      if (!template) {
        return "No active agreement template found. Please contact an administrator.";
      }

      // Create agreement
      const { data: agreement, error } = await supabase
        .from('leases')
        .insert({
          customer_id: customer.id,
          agreement_type: template.agreement_type,
          status: 'pending_payment',
          total_amount: template.rent_amount,
          rent_amount: template.rent_amount,
          agreement_duration: template.agreement_duration,
          daily_late_fee: template.daily_late_fee
        })
        .select()
        .single();

      if (error) throw error;

      return `Agreement created successfully!\nAgreement Number: ${agreement.agreement_number}\nCustomer: ${customer.full_name}\nStatus: Pending Payment`;
    } catch (error) {
      console.error('Error creating agreement:', error);
      return "Failed to create agreement. Please try again or contact support.";
    }
  }

  // Payment Processing Command
  const paymentMatch = lowerMessage.match(/pay\s+(?:qar\s+)?(\d+(?:\.\d{2})?)\s+for\s+(?:invoice\s+)?#?(\w+)/i);
  if (paymentMatch) {
    const amount = parseFloat(paymentMatch[1]);
    const invoiceNumber = paymentMatch[2];

    try {
      // Find invoice
      const { data: invoice } = await supabase
        .from('accounting_invoices')
        .select('*')
        .eq('invoice_number', invoiceNumber)
        .single();

      if (!invoice) {
        return `Invoice #${invoiceNumber} not found. Please verify the invoice number and try again.`;
      }

      // Process payment
      const { data: payment, error } = await supabase
        .from('unified_payments')
        .insert({
          amount: amount,
          amount_paid: amount,
          payment_method: 'Cash',
          status: 'completed',
          type: 'Income',
          description: `Payment for Invoice #${invoiceNumber}`,
          payment_date: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Update invoice status
      await supabase
        .from('accounting_invoices')
        .update({ status: 'paid', paid_date: new Date().toISOString() })
        .eq('id', invoice.id);

      return `Payment processed successfully!\nAmount: QAR ${amount}\nInvoice: #${invoiceNumber}\nStatus: Completed`;
    } catch (error) {
      console.error('Error processing payment:', error);
      return "Failed to process payment. Please try again or contact support.";
    }
  }

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

  // Vehicle maintenance history
  const maintenanceMatch = normalizedMessage.match(/maintenance.*for.*([A-Z0-9-]+)/i);
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

  return null;
}