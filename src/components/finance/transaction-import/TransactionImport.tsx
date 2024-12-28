import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileUploadSection } from "./components/FileUploadSection";
import { TransactionPreviewTable } from "./TransactionPreviewTable";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Papa from 'papaparse';

interface Transaction {
  amount: number;
  transaction_date: string;
  description?: string;
  metadata: {
    agreement_number?: string;
  };
}

export const TransactionImport = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [importedData, setImportedData] = useState<any[]>([]);
  const [fallbackData, setFallbackData] = useState<Transaction[]>([]);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const navigate = useNavigate();

  const validateTransactions = (transactions: Transaction[]): boolean => {
    if (!Array.isArray(transactions) || transactions.length === 0) {
      console.error('Invalid transactions array:', transactions);
      return false;
    }

    return transactions.every(transaction => {
      const isValid = 
        transaction &&
        typeof transaction.amount === 'number' &&
        transaction.amount > 0 &&
        transaction.transaction_date &&
        !isNaN(new Date(transaction.transaction_date).getTime());

      if (!isValid) {
        console.warn('Invalid transaction:', transaction);
      }
      return isValid;
    });
  };

  const processFileLocally = async (file: File): Promise<Transaction[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          const transactions = results.data.map((row: any) => ({
            type: 'INCOME',
            amount: parseFloat(row.amount),
            description: row.description?.trim(),
            transaction_date: new Date(row.date).toISOString(),
            reference_type: 'import',
            status: 'completed',
            metadata: {
              agreement_number: row.agreement_number?.trim(),
            }
          }));
          resolve(transactions);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  };

  const retryImport = async (transactions: Transaction[]) => {
    try {
      console.log('Retrying import with transactions:', transactions);
      
      const { data, error } = await supabase.functions
        .invoke("process-transaction-import", {
          body: { transactions }
        });

      if (error) throw error;
      
      await queryClient.invalidateQueries({ queryKey: ["transactions"] });
      
      toast({
        title: "Import Complete",
        description: "Your transactions have been processed successfully.",
      });

      setFallbackData([]);
      navigate("/finance?tab=dashboard");
    } catch (error: any) {
      console.error("Retry import error:", error);
      toast({
        title: "Import Error",
        description: error.message || "Failed to process import",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "text/csv") {
      toast({
        title: "Invalid File Type",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      // Process file locally first
      const transactions = await processFileLocally(file);
      console.log('Processed transactions:', transactions);

      // Validate transactions
      if (!validateTransactions(transactions)) {
        throw new Error('Invalid transaction data in file');
      }

      // Store as fallback
      setFallbackData(transactions);

      const fileName = `transactions/${Date.now()}_${file.name}`;
      
      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from("imports")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Show success notification
      toast({
        title: "Import Started",
        description: "Your import has been initiated. You'll be redirected to the dashboard.",
      });

      // Start processing in the background
      const processingPromise = supabase.functions
        .invoke("process-transaction-import", {
          body: { fileName }
        })
        .then(async ({ data, error }) => {
          if (error) throw error;
          
          await queryClient.invalidateQueries({ queryKey: ["transactions"] });
          
          toast({
            title: "Import Complete",
            description: "Your transactions have been processed successfully.",
          });
        })
        .catch((error) => {
          console.error("Import error:", error);
          
          // If we have fallback data, attempt retry
          if (fallbackData.length > 0) {
            toast({
              title: "Retrying Import",
              description: "Attempting to process transactions again...",
            });
            return retryImport(fallbackData);
          }

          toast({
            title: "Import Error",
            description: error.message || "Failed to process import",
            variant: "destructive",
          });
        })
        .finally(() => {
          setIsUploading(false);
        });

      // Redirect to dashboard immediately after starting the import
      navigate("/finance?tab=dashboard");

    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload file",
        variant: "destructive",
      });
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <FileUploadSection 
        onFileUpload={handleFileUpload}
        isUploading={isUploading}
      />
      
      {isUploading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Processing file...
        </div>
      )}
      
      <TransactionPreviewTable 
        data={importedData}
        onDataChange={setImportedData}
      />
    </div>
  );
};