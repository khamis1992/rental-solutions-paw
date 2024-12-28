import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileUploadSection } from "./components/FileUploadSection";
import { TransactionPreviewTable } from "./TransactionPreviewTable";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { TransactionType } from "../accounting/types/transaction.types";

interface ImportedTransaction {
  agreement_number: string;
  payment_date: string;
  amount: number;
  description: string;
  customer_name?: string;
  is_valid_date?: boolean;
  verification_message?: string;
}

export const TransactionImport = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [importedData, setImportedData] = useState<ImportedTransaction[]>([]);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const verifyCustomer = async (agreementNumber: string, paymentDate: string) => {
    try {
      const { data: verificationData, error: verificationError } = await supabase.functions
        .invoke('verify-transaction-customer', {
          body: { agreementNumber, paymentDate }
        });

      if (verificationError) throw verificationError;
      
      return {
        customerName: verificationData.data?.customerName || 'Unknown',
        isValidDate: verificationData.data?.isValidDate || false,
        message: verificationData.data?.message
      };
    } catch (error) {
      console.error('Customer verification error:', error);
      return {
        customerName: 'Error',
        isValidDate: false,
        message: error.message
      };
    }
  };

  const saveTransactionsToDatabase = async (transactions: ImportedTransaction[]) => {
    const { error } = await supabase
      .from('accounting_transactions')
      .insert(transactions.map(transaction => ({
        type: TransactionType.INCOME,
        amount: transaction.amount,
        description: transaction.description,
        transaction_date: transaction.payment_date,
        reference_type: 'import',
        status: 'completed',
        metadata: {
          agreement_number: transaction.agreement_number,
          customer_name: transaction.customer_name,
          verification_message: transaction.verification_message
        }
      })));

    if (error) throw error;
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
          .filter((row) => row.trim().length > 0)
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

        console.log('Parsed rows:', rows);

        const enrichedRows = await Promise.all(
          rows.map(async (row) => {
            const customerInfo = await verifyCustomer(
              row.agreement_number, 
              row.payment_date
            );
            
            return {
              ...row,
              customer_name: customerInfo.customerName,
              is_valid_date: customerInfo.isValidDate,
              verification_message: customerInfo.message
            };
          })
        );

        console.log('Enriched rows:', enrichedRows);

        // Save transactions to database
        await saveTransactionsToDatabase(enrichedRows);

        // Update the state with the enriched data
        setImportedData(enrichedRows);

        toast({
          title: "Success",
          description: `Successfully imported ${enrichedRows.length} transactions`,
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
        <div className="flex justify-end">
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