import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ImportErrorAnalysis } from "@/components/finance/import/ImportErrorAnalysis";
import { PaymentMethodType } from "@/components/finance/types/transaction.types";

const REQUIRED_FIELDS = [
  'Transaction_ID',
  'Agreement_Number',
  'Customer_Name',
  'License_Plate',
  'Amount',
  'Payment_Method',
  'Description',
  'Payment_Date',
  'Type',
  'Status'
] as const;

type ImportedData = Record<string, unknown>;

export const PaymentImport = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importErrors, setImportErrors] = useState<any[]>([]);
  const queryClient = useQueryClient();

  const validateHeaders = (headers: string[]): { isValid: boolean; missingFields: string[] } => {
    const normalizedHeaders = headers.map(h => h.trim());
    const missingFields = REQUIRED_FIELDS.filter(
      field => !normalizedHeaders.includes(field)
    );
    return {
      isValid: missingFields.length === 0,
      missingFields
    };
  };

  const downloadTemplate = () => {
    const csvContent = REQUIRED_FIELDS.join(',') + '\n' +
                      '1000,20-03-2024,credit_card,completed,Monthly payment for March,INV001,lease-uuid-here';
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'payment_import_template.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result as string;
        
        Papa.parse(text, {
          header: true,
          complete: async (results) => {
            const headers = results.meta.fields || [];
            const headerValidation = validateHeaders(headers);

            if (!headerValidation.isValid) {
              toast.error(`Missing required columns: ${headerValidation.missingFields.join(', ')}`);
              setIsUploading(false);
              return;
            }

            setHeaders(headers);
            const parsedData = results.data as ImportedData[];
            setImportedData(parsedData);

            for (const row of parsedData) {
              const rawImport: Partial<RawPaymentImport> = {
                Transaction_ID: row.Transaction_ID as string,
                Agreement_Number: row.Agreement_Number as string,
                Customer_Name: row.Customer_Name as string,
                License_Plate: row.License_Plate as string,
                Amount: Number(row.Amount),
                Payment_Method: normalizePaymentMethod(row.Payment_Method as string),
                Description: row.Description as string,
                Payment_Date: row.Payment_Date as string,
                Type: row.Type as string,
                Status: row.Status as string,
                is_valid: true
              };

              const { error: insertError } = await supabase
                .from('raw_payment_imports')
                .insert(rawImport);

              if (insertError) {
                console.error('Raw data import error:', insertError);
                toast.error('Failed to store raw data');
              } else {
                toast.success('Raw data imported successfully');
                await queryClient.invalidateQueries({ queryKey: ['raw-payment-imports'] });
              }
            }
          },
          error: (error) => {
            console.error('CSV Parse Error:', error);
            toast.error('Failed to parse CSV file');
          }
        });
      };
      
      reader.readAsText(file);
    } catch (error) {
      if (error instanceof Error) {
        console.error('Import error:', error);
        toast.error(error.message || 'Failed to import file');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const normalizePaymentMethod = (method: string): PaymentMethodType => {
    const methodMap: Record<string, PaymentMethodType> = {
      'cash': 'Cash',
      'invoice': 'Invoice',
      'wire': 'WireTransfer',
      'wiretransfer': 'WireTransfer',
      'cheque': 'Cheque',
      'check': 'Cheque',
      'deposit': 'Deposit',
      'onhold': 'On_hold',
      'on_hold': 'On_hold',
      'on-hold': 'On_hold'
    };

    const normalized = method.toLowerCase().replace(/[^a-z]/g, '');
    return methodMap[normalized] || 'Cash';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          disabled={isUploading}
        />
        <Button
          variant="outline"
          onClick={downloadTemplate}
          disabled={isUploading}
        >
          Download Template
        </Button>
      </div>
      
      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Importing payments...
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {importErrors.length > 0 && (
        <ImportErrorAnalysis 
          errors={importErrors}
          onSuggestionClick={handleSuggestionClick}
        />
      )}
    </div>
  );
};
