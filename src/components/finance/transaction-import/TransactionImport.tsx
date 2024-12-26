import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileUploadSection } from "./components/FileUploadSection";
import { TransactionPreviewTable } from "./TransactionPreviewTable";

export const TransactionImport = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [importedData, setImportedData] = useState<any[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        const csvContent = e.target?.result as string;
        const rows = csvContent.split('\n')
          .map(row => {
            const values = row.split(',').map(value => value.trim());
            // Map values to specific columns in the required order
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

        setImportedData(rows);

        const { error: functionError } = await supabase.functions
          .invoke('process-transaction-import', {
            body: { rows }
          });

        if (functionError) throw functionError;

        toast({
          title: "Success",
          description: "Transactions imported successfully",
        });

        // Invalidate relevant queries to refresh the data
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["accounting-transactions"] }),
          queryClient.invalidateQueries({ queryKey: ["recent-transactions"] }),
          queryClient.invalidateQueries({ queryKey: ["financial-overview"] }),
          queryClient.invalidateQueries({ queryKey: ["transaction-imports"] })
        ]);
      };

      reader.onerror = () => {
        throw new Error('Error reading file');
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

  return (
    <div className="space-y-4">
      <FileUploadSection 
        onFileUpload={handleFileUpload}
        isUploading={isUploading}
      />
      {importedData.length > 0 && (
        <TransactionPreviewTable 
          data={importedData}
          onDataChange={setImportedData}
        />
      )}
    </div>
  );
};