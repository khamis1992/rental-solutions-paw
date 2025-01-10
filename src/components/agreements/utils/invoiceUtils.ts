import { supabase } from "@/integrations/supabase/client";
import { Payment } from "@/types/database/payment.types";

export interface InvoiceData {
  invoiceNumber: string;
  customerName: string;
  customerAddress: string;
  startDate: string;
  endDate: string;
  dueDate?: string;
  vehicleDetails: string;
  agreementType: string;
  items: Array<{
    description: string;
    amount: number;
  }>;
  payments?: Payment[];
}

export const transformPayments = (dbPayments: any[]): Payment[] => {
  return dbPayments.map(payment => ({
    id: payment.id,
    lease_id: payment.lease_id,
    amount: payment.amount,
    amount_paid: payment.amount_paid,
    balance: payment.balance,
    payment_date: payment.payment_date,
    due_date: payment.due_date,
    transaction_id: payment.transaction_id,
    payment_method: payment.payment_method,
    status: payment.status,
    description: payment.description,
    type: payment.type || 'Income',
    is_recurring: payment.is_recurring || false,
    recurring_interval: payment.recurring_interval || '',
    next_payment_date: payment.next_payment_date,
    late_fine_amount: payment.late_fine_amount || 0,
    days_overdue: payment.days_overdue || 0,
    include_in_calculation: payment.include_in_calculation ?? true,
    invoice_id: payment.invoice_id,
    security_deposit_id: payment.security_deposit_id,
    created_at: payment.created_at,
    updated_at: payment.updated_at
  }));
};

export const generateInvoiceData = async (agreementId: string): Promise<InvoiceData | null> => {
  try {
    const { data: agreement, error: agreementError } = await supabase
      .from('leases')
      .select(`
        *,
        customer:profiles(full_name, address),
        vehicle:vehicles(make, model, year)
      `)
      .eq('id', agreementId)
      .single();

    if (agreementError) throw agreementError;

    const { data: payments, error: paymentsError } = await supabase
      .from('new_unified_payments')
      .select('*')
      .eq('lease_id', agreementId)
      .order('payment_date', { ascending: true });

    if (paymentsError) throw paymentsError;

    return {
      invoiceNumber: agreement.agreement_number || `INV-${Date.now()}`,
      customerName: agreement.customer?.full_name || 'Unknown Customer',
      customerAddress: agreement.customer?.address || 'No address provided',
      startDate: new Date(agreement.start_date).toLocaleDateString(),
      endDate: new Date(agreement.end_date).toLocaleDateString(),
      vehicleDetails: `${agreement.vehicle?.year} ${agreement.vehicle?.make} ${agreement.vehicle?.model}`,
      agreementType: agreement.agreement_type,
      items: [{
        description: 'Rental Fee',
        amount: agreement.total_amount
      }],
      payments: transformPayments(payments || [])
    };
  } catch (error) {
    console.error('Error generating invoice data:', error);
    return null;
  }
};