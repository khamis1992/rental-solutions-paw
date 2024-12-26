import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { saveTransactions, TransactionRow } from "../services/transactionService";
import { validateImportData } from "../utils/importValidation";

export const useTransactionImport = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [validRows, setValidRows] = useState<TransactionRow[]>([]);
  const [skippedRows, setSkippedRows] = useState<Array<{ index: number; content: string; reason: string }>>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "text/csv") {
      toast({
        title: "Error",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const text = await file.text();
      const { validRows, skippedRows } = validateImportData(text);
      
      setValidRows(validRows);
      setSkippedRows(skippedRows);

      // Immediately save to database
      await saveTransactions(validRows);

      toast({
        title: "Success",
        description: `Successfully imported ${validRows.length} transactions. ${skippedRows.length} rows were skipped.`,
      });
      
      // Refresh the transactions list
      await queryClient.invalidateQueries({ queryKey: ["transactions"] });
      
    } catch (error: any) {
      console.error('Import error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to import transactions",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveTransactions = async () => {
    if (validRows.length === 0) {
      toast({
        title: "Error",
        description: "No valid data to import",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      await saveTransactions(validRows);

      toast({
        title: "Success",
        description: `Successfully imported ${validRows.length} transactions.`,
      });
      
      await queryClient.invalidateQueries({ queryKey: ["transactions"] });
      
      setValidRows([]);
      setSkippedRows([]);
    } catch (error: any) {
      console.error('Import error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to import transactions",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return {
    isUploading,
    validRows,
    skippedRows,
    handleFileUpload,
    handleSaveTransactions
  };
};