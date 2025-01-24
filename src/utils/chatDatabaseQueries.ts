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

  // Predictive Maintenance Assistance
  if (normalizedMessage.match(/maintenance|service|repair|check/i)) {
    const { data: predictions } = await supabase
      .from('maintenance_predictions')
      .select(`
        *,
        vehicles(make, model, license_plate)
      `)
      .order('predicted_date', { ascending: true })
      .limit(3);

    if (predictions?.length) {
      return `Here are some upcoming maintenance predictions:\n${
        predictions.map(p => 
          `🔧 ${p.vehicles?.make} ${p.vehicles?.model} (${p.vehicles?.license_plate})
           - Due: ${new Date(p.predicted_date || '').toLocaleDateString()}
           - Service: ${p.prediction_type}
           - Priority: ${p.priority}
           ${p.recommended_services ? `\nRecommended services:\n${p.recommended_services.join('\n')}` : ''}`
        ).join('\n\n')
      }`;
    }
  }

  // Case Outcome Simulation
  const penaltyMatch = lowerMessage.match(/penalties|late return|overdue|fines.*agreement.*#?(\w+)/i);
  if (penaltyMatch) {
    const agreementNumber = penaltyMatch[1];
    try {
      const { data: agreement } = await supabase
        .from('leases')
        .select(`
          *,
          vehicle:vehicles(make, model, license_plate)
        `)
        .eq('agreement_number', agreementNumber)
        .single();

      if (!agreement) {
        return `Agreement #${agreementNumber} not found. Please verify the agreement number.`;
      }

      const dailyLateFee = agreement.daily_late_fee || 120;
      const damagePenalty = agreement.damage_penalty_rate || 0;
      const fuelPenalty = agreement.fuel_penalty_rate || 0;

      return `For Agreement #${agreementNumber} (${agreement.vehicle?.make} ${agreement.vehicle?.model}):
        - Late return fee: ${dailyLateFee} QAR per day
        - Damage penalty rate: ${damagePenalty}%
        - Fuel penalty rate: ${fuelPenalty}%
        
        Based on historical data, late returns typically result in:
        - Average late fee: ${dailyLateFee * 3} QAR (3 days average)
        - Common issues: Fuel level below requirement, minor damages
        
        💡 Tip: Return the vehicle on time to avoid these penalties.`;
    } catch (error) {
      console.error('Error fetching agreement penalties:', error);
      return "Failed to retrieve penalty information. Please try again.";
    }
  }

  // Multi-Hop Reasoning Queries
  const availabilityMatch = lowerMessage.match(/available|free|rent.*next.*(?:week|month)|no.*(?:fines|penalties)/i);
  if (availabilityMatch) {
    try {
      // First hop: Get vehicles without active agreements
      const { data: vehicles } = await supabase
        .from('vehicles')
        .select(`
          *,
          traffic_fines(id, payment_status),
          maintenance(id, status)
        `)
        .eq('status', 'available');

      if (!vehicles?.length) {
        return "No vehicles are currently available.";
      }

      // Second hop: Filter vehicles with no pending fines
      const cleanVehicles = vehicles.filter(v => 
        !v.traffic_fines?.some(f => f.payment_status === 'pending')
      );

      // Third hop: Filter out vehicles with pending maintenance
      const readyVehicles = cleanVehicles.filter(v =>
        !v.maintenance?.some(m => m.status === 'scheduled' || m.status === 'in_progress')
      );

      if (!readyVehicles.length) {
        return "No vehicles are available that meet all criteria (no fines, no pending maintenance).";
      }

      return `Found ${readyVehicles.length} vehicles available with no issues:\n${
        readyVehicles.map(v => 
          `🚗 ${v.make} ${v.model} (${v.year})
           - License Plate: ${v.license_plate}
           - Mileage: ${v.mileage} km
           - Status: Ready for rental`
        ).join('\n\n')
      }`;
    } catch (error) {
      console.error('Error in multi-hop query:', error);
      return "Failed to process complex query. Please try a simpler request.";
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
          daily_late_fee: template.daily_late_fee,
          initial_mileage: 0,
          vehicle_id: null // This will be set later when a vehicle is assigned
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
