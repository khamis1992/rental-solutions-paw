import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BulkPaymentDetails {
  firstChequeNumber: string;
  totalCheques: number;
  amount: string;
  startDate: string;
  draweeBankName: string;
  contractId: string;
}

export const useBulkPayments = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateInputs = (details: BulkPaymentDetails) => {
    const chequeBase = details.firstChequeNumber.replace(/\D/g, '');
    if (!chequeBase || isNaN(Number(chequeBase))) {
      throw new Error("Invalid cheque number format");
    }
    if (!Number.isInteger(details.totalCheques) || details.totalCheques <= 0) {
      throw new Error("Total cheques must be a positive integer");
    }
    if (!details.amount || isNaN(Number(details.amount))) {
      throw new Error("Invalid amount");
    }
    if (!details.startDate) {
      throw new Error("Start date is required");
    }
    if (!details.draweeBankName) {
      throw new Error("Bank name is required");
    }
  };

  const submitBulkPayments = async (details: BulkPaymentDetails) => {
    setIsSubmitting(true);
    try {
      validateInputs(details);

      const { data, error } = await supabase.functions.invoke('create-bulk-payments', {
        body: details
      });

      if (error) throw error;

      toast.success(`Successfully created ${details.totalCheques} payment installments`);
      return data;
    } catch (error) {
      console.error('Error creating bulk payments:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create payments');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    submitBulkPayments
  };
};