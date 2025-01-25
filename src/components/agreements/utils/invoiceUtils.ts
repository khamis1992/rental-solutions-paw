import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Payment } from "@/types/database/payment.types";

export type InvoiceData = {
  invoiceNumber: string;
  customerName: string;
  customerAddress: string;
  vehicleDetails: string;
  agreementType: string;
  startDate: string;
  endDate: string;
  amount: number;
  items: {
    description: string;
    amount: number;
  }[];
  subtotal: number;
  discount: number;
  total: number;
  dueDate?: string;
  payments?: Payment[];
  agreementId: string;
};

export const generateInvoiceData = async (leaseId: string): Promise<InvoiceData | null> => {
  const { data: lease, error: leaseError } = await supabase
    .from("leases")
    .select(`
      *,
      customer:profiles(*),
      vehicle:vehicles(*)
    `)
    .eq("id", leaseId)
    .single();

  if (leaseError || !lease) {
    console.error("Error fetching lease data:", leaseError);
    return null;
  }

  // Fetch remaining amount data for the agreement
  const { data: remainingAmount, error: remainingError } = await supabase
    .from("remaining_amounts")
    .select("*")
    .eq("agreement_number", lease.agreement_number)
    .maybeSingle();

  if (remainingError) {
    console.error("Error fetching remaining amount:", remainingError);
    return null;
  }

  // Fetch all payments for this lease
  const { data: payments, error: paymentsError } = await supabase
    .from("payments")
    .select("*")
    .eq("lease_id", leaseId)
    .order("payment_date", { ascending: true });

  if (paymentsError) {
    console.error("Error fetching payments:", paymentsError);
    return null;
  }

  const items = [];
  if (lease.agreement_type === "short_term") {
    items.push({
      description: `Short-term rental (${format(new Date(lease.start_date), "PP")} - ${format(new Date(lease.end_date), "PP")})`,
      amount: lease.rent_amount || 0  // Use rent_amount instead of final_price
    });
  } else {
    if (lease.down_payment) {
      items.push({
        description: "Down payment",
        amount: lease.down_payment
      });
    }
    if (lease.rent_amount) {
      items.push({
        description: `Monthly payment (${format(new Date(lease.start_date), "MMMM yyyy")})`,
        amount: lease.rent_amount
      });
    }
  }

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const totalDiscount = 0; // Add discount logic if needed
  const total = subtotal - totalDiscount;

  return {
    invoiceNumber: `INV-${lease.id.slice(0, 8)}`,
    customerName: lease.customer?.full_name || "Unknown Customer",
    customerAddress: lease.customer?.address || "No address provided",
    vehicleDetails: `${lease.vehicle?.year} ${lease.vehicle?.make} ${lease.vehicle?.model}`,
    agreementType: lease.agreement_type === "short_term" ? "Short-term Rental" : "Lease-to-Own",
    startDate: format(new Date(lease.start_date), "PP"),
    endDate: format(new Date(lease.end_date), "PP"),
    amount: lease.rent_amount || 0,  // Use rent_amount as the main amount
    items,
    subtotal,
    discount: totalDiscount,
    total,
    dueDate: lease.agreement_type === "lease_to_own" 
      ? format(new Date(lease.start_date), "PP") 
      : undefined,
    payments: payments || [],
    agreementId: lease.id
  };
};