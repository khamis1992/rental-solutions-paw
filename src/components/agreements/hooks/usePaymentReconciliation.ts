import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { parsePaymentCsv, validatePaymentCsvHeaders } from "../utils/csvUtils";

export const usePaymentReconciliation = () => {
  const [isReconciling, setIsReconciling] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const reconcilePayments = async (agreementId: string) => {
    if (!agreementId) {
      toast({
        title: "Error",
        description: "Agreement ID is required for reconciliation",
        variant: "destructive",
      });
      return;
    }

    setIsReconciling(true);
    try {
      console.log('Calling reconciliation with agreementId:', agreementId);
      
      const { data, error } = await supabase.functions.invoke('process-payment-reconciliation', {
        body: { agreementId }
      });

      if (error) throw error;

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["payment-history"] }),
        queryClient.invalidateQueries({ queryKey: ["payment-reconciliation"] }),
        queryClient.invalidateQueries({ queryKey: ["agreements"] }),
        queryClient.invalidateQueries({ queryKey: ["financial-reports"] })
      ]);

      toast({
        title: "Success",
        description: "Payment reconciliation completed successfully",
      });

      return data;
    } catch (error: any) {
      console.error('Reconciliation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to reconcile payment",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsReconciling(false);
    }
  };

  const handleCsvUpload = async (file: File) => {
    setIsReconciling(true);
    try {
      const content = await file.text();
      const lines = content.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());

      const validation = validatePaymentCsvHeaders(headers);
      if (!validation.isValid) {
        throw new Error(`Missing required headers: ${validation.missingHeaders.join(', ')}`);
      }

      const records = parsePaymentCsv(content);
      
      const { error } = await supabase.functions.invoke('process-payment-reconciliation', {
        body: { csvData: records }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Successfully processed ${records.length} payment records`,
      });

      // Refresh relevant queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["payment-history"] }),
        queryClient.invalidateQueries({ queryKey: ["payment-reconciliation"] }),
        queryClient.invalidateQueries({ queryKey: ["agreements"] })
      ]);

    } catch (error: any) {
      console.error('CSV upload error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process CSV file",
        variant: "destructive",
      });
    } finally {
      setIsReconciling(false);
    }
  };

  return {
    isReconciling,
    reconcilePayments,
    handleCsvUpload
  };
};