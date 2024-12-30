import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TransactionPreviewTable } from "./TransactionPreviewTable";
import { FileUploadSection } from "./components/FileUploadSection";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ImportedTransaction, RawTransactionImport } from "./types/transaction.types";

export const TransactionImport = () => {
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Query to fetch existing imported transactions
  const { data: importedData = [], isLoading } = useQuery({
    queryKey: ['imported-transactions'],
    queryFn: async () => {
      // Remove the problematic neq filter and fetch all records
      const { data, error } = await supabase
        .from('raw_transaction_imports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Query error:', error);
        throw error;
      }
      
      return (data || []).map(item => item.raw_data);
    }
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        const csvContent = e.target?.result as string;
        const rows: ImportedTransaction[] = csvContent.split('\n')
          .map(row => {
            const values = row.split(',').map(value => value.trim());
            return {
              agreement_number: values[0] || '',
              customer_name: values[1] || '',
              amount: parseFloat(values[2]) || 0,
              license_plate: values[3] || '',
              vehicle: values[4] || '',
              payment_date: values[5] || '',
              payment_method: values[6] || '',
              payment_number: values[7] || '',
              description: values[8] || ''
            };
          })
          .filter((row, index) => index > 0); // Skip header row

        if (rows.length === 0) {
          toast({
            title: "Error",
            description: "No valid rows found in the CSV file",
            variant: "destructive",
          });
          return;
        }

        console.log('Processed rows:', rows);

        // Save to Supabase
        const { error: functionError } = await supabase.functions
          .invoke('process-transaction-import', {
            body: { rows }
          });

        if (functionError) {
          console.error('Import error:', functionError);
          toast({
            title: "Error",
            description: "Failed to import transactions. Please try again.",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Success",
          description: `Successfully imported ${rows.length} transactions`,
        });

        // Refresh the data
        queryClient.invalidateQueries({ queryKey: ['imported-transactions'] });
      };

      reader.onerror = () => {
        toast({
          title: "Error",
          description: "Failed to read file",
          variant: "destructive",
        });
      };

      reader.readAsText(file);
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

  const handleDeleteAll = async () => {
    try {
      const { error } = await supabase
        .from('raw_transaction_imports')
        .delete()
        .neq('id', '0'); // Use a valid UUID comparison

      if (error) throw error;

      toast({
        title: "Success",
        description: "All imported transactions have been deleted",
      });

      // Refresh the data
      queryClient.invalidateQueries({ queryKey: ['imported-transactions'] });
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: "Failed to delete transactions",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <FileUploadSection 
          onFileUpload={handleFileUpload}
          isUploading={isUploading}
        />
        {importedData.length > 0 && (
          <Button
            variant="destructive"
            onClick={handleDeleteAll}
            className="ml-4"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete All
          </Button>
        )}
      </div>
      
      {!isLoading && importedData.length > 0 && (
        <TransactionPreviewTable 
          data={importedData}
          onDataChange={() => {}}
        />
      )}
    </div>
  );
};