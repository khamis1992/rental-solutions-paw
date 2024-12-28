import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileUploadSection } from "./components/FileUploadSection";
import { TransactionPreviewTable } from "./TransactionPreviewTable";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export const TransactionImport = () => {
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const verifyCustomer = async (agreementNumber: string, paymentDate: string) => {
    try {
      const { data: verificationData, error: verificationError } = await supabase.functions
        .invoke('verify-transaction-customer', {
          body: { agreementNumber, paymentDate }
        });

      if (verificationError) throw verificationError;
      return verificationData.data;
    } catch (error) {
      console.error('Customer verification error:', error);
      return null;
    }
  };

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
            return {
              agreement_number: values[0] || '',
              payment_date: values[5] || '',
              amount: parseFloat(values[2]) || 0,
              description: values[8] || ''
            };
          })
          .filter((row, index) => index > 0); // Skip header row

        // Verify customer for each row
        const enrichedRows = await Promise.all(
          rows.map(async (row) => {
            const customerInfo = await verifyCustomer(
              row.agreement_number, 
              row.payment_date
            );
            
            return {
              ...row,
              customer_name: customerInfo?.customerName || 'Unknown',
              is_valid_date: customerInfo?.isValidDate || false
            };
          })
        );

        // Process the enriched data
        const { error: functionError } = await supabase.functions
          .invoke('process-transaction-import', {
            body: { rows: enrichedRows }
          });

        if (functionError) throw functionError;

        toast({
          title: "Success",
          description: `Successfully processed ${enrichedRows.length} transactions`,
        });

        queryClient.invalidateQueries({ queryKey: ['transactions'] });
      };

      reader.onerror = () => {
        throw new Error('Failed to read file');
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
      
      <TransactionPreviewTable 
        data={[]} // This will be populated when files are imported
        onDataChange={() => {}}
      />
    </div>
  );
};