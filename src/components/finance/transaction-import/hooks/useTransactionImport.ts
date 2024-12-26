import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { saveTransactions, TransactionRow } from "../services/transactionService";
import Papa from 'papaparse';

export const useTransactionImport = () => {
  const [isUploading, setIsUploading] = useState(false);
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
      
      Papa.parse(text, {
        header: true,
        complete: async (results) => {
          try {
            await saveTransactions(results.data as TransactionRow[]);
            
            toast({
              title: "Success",
              description: `Successfully imported ${results.data.length} transactions.`,
            });
            
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
        },
        error: (error) => {
          console.error('CSV parsing error:', error);
          toast({
            title: "Error",
            description: "Failed to parse CSV file",
            variant: "destructive",
          });
          setIsUploading(false);
        }
      });
    } catch (error: any) {
      console.error('File reading error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to read file",
        variant: "destructive",
      });
      setIsUploading(false);
    }
  };

  return {
    isUploading,
    handleFileUpload,
  };
};