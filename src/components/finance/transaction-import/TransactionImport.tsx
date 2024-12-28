import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileUploadSection } from "./components/FileUploadSection";
import { TransactionPreviewTable } from "./TransactionPreviewTable";
import { Button } from "@/components/ui/button";
import { Trash2, Wand2 } from "lucide-react";

interface ImportedTransaction {
  agreement_number: string;
  payment_date: string;
  amount: number;
  description: string;
  customer_name?: string;
}

export const TransactionImport = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [importedData, setImportedData] = useState<ImportedTransaction[]>([]);
  const queryClient = useQueryClient();
  const { toast } = useToast();

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
          .filter((row, index) => index > 0 && row.agreement_number);

        // Verify customer for each row
        const enrichedRows = await Promise.all(
          rows.map(async (row) => {
            const { data: verificationData } = await supabase.functions
              .invoke('verify-transaction-customer', {
                body: { 
                  agreementNumber: row.agreement_number,
                  paymentDate: row.payment_date
                }
              });
            
            return {
              ...row,
              customer_name: verificationData?.customerName || 'Unknown'
            };
          })
        );

        setImportedData(enrichedRows);
        toast({
          title: "Success",
          description: "File processed successfully",
        });

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

  const handleAutoAssign = async () => {
    if (importedData.length === 0) {
      toast({
        title: "Error",
        description: "No transactions to assign",
        variant: "destructive",
      });
      return;
    }

    setIsAssigning(true);
    try {
      const { error } = await supabase.functions
        .invoke('process-transaction-import', {
          body: { transactions: importedData }
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Transactions assigned successfully",
      });

      // Refresh relevant queries
      await queryClient.invalidateQueries({ queryKey: ['transactions'] });
      await queryClient.invalidateQueries({ queryKey: ['customer-profiles'] });
      
      // Clear the imported data
      setImportedData([]);

    } catch (error: any) {
      console.error('Auto-assign error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to assign transactions",
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleClearData = () => {
    setImportedData([]);
  };

  return (
    <div className="space-y-4">
      <FileUploadSection 
        onFileUpload={handleFileUpload}
        isUploading={isUploading}
      />
      
      {importedData.length > 0 && (
        <div className="flex justify-between items-center">
          <Button
            onClick={handleAutoAssign}
            disabled={isAssigning || importedData.length === 0}
            className="bg-primary hover:bg-primary/90"
          >
            <Wand2 className="h-4 w-4 mr-2" />
            {isAssigning ? "Assigning..." : "Auto Assign"}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearData}
            className="text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Data
          </Button>
        </div>
      )}
      
      <TransactionPreviewTable 
        data={importedData}
        onDataChange={setImportedData}
      />
    </div>
  );
};