import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { ImportActions } from "./components/ImportActions";
import { TransactionTable } from "./components/TransactionTable";
import { saveTransactionImport, deleteAllTransactions } from "./services/transactionImportService";
import Papa from 'papaparse';
import { ImportedTransaction } from "./types/transaction.types";

export const TransactionImport = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: transactions = [] } = useQuery({
    queryKey: ['imported-transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('raw_transaction_imports')
        .select('raw_data')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data.map(item => item.raw_data as unknown as ImportedTransaction);
    }
  });

  const handleImportClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e) => handleFileUpload(e);
    input.click();
  };

  const handleFileUpload = async (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const text = await file.text();
      
      Papa.parse(text, {
        header: true,
        complete: async (results) => {
          try {
            const parsedData = results.data as ImportedTransaction[];
            await saveTransactionImport(parsedData);
            
            toast({
              title: "Success",
              description: `Successfully imported ${results.data.length} transactions.`,
            });
            
            await queryClient.invalidateQueries({ queryKey: ['imported-transactions'] });
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

  const handleDeleteAll = async () => {
    try {
      await deleteAllTransactions();
      await queryClient.invalidateQueries({ queryKey: ['imported-transactions'] });
      toast({
        title: "Success",
        description: "All transactions have been deleted.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete transactions",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-6">
      <ImportActions
        onImportClick={handleImportClick}
        onDeleteAll={handleDeleteAll}
        isUploading={isUploading}
        hasTransactions={transactions.length > 0}
      />
      <TransactionTable transactions={transactions} />
    </Card>
  );
};