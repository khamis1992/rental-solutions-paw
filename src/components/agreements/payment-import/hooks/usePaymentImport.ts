import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { RawPaymentImport } from "@/components/finance/types/transaction.types";
import Papa from 'papaparse';
import { validateHeaders, normalizePaymentMethod } from "../utils/paymentUtils";

export const usePaymentImport = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [importedData, setImportedData] = useState<Record<string, unknown>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const downloadTemplate = () => {
    const csvContent = [
      'Transaction_ID,Agreement_Number,Customer_Name,License_Plate,Amount,Payment_Method,Description,Payment_Date,Type,Status',
      '1000,20-03-2024,credit_card,completed,Monthly payment for March,INV001,lease-uuid-here'
    ].join('\n');
    
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
            const parsedData = results.data as Record<string, unknown>[];
            setImportedData(parsedData);

            for (const row of parsedData) {
              try {
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
                  is_valid: false // Start as false until properly assigned
                };

                // First, check if this payment is already imported
                const { data: existingPayment } = await supabase
                  .from('raw_payment_imports')
                  .select('id')
                  .eq('Transaction_ID', rawImport.Transaction_ID)
                  .single();

                if (!existingPayment) {
                  const { error: insertError } = await supabase
                    .from('raw_payment_imports')
                    .insert(rawImport);

                  if (insertError) {
                    console.error('Raw data import error:', insertError);
                    toast.error(`Failed to store raw data for transaction ${rawImport.Transaction_ID}`);
                  } else {
                    console.log(`Successfully imported transaction ${rawImport.Transaction_ID}`);
                  }
                } else {
                  console.log(`Transaction ${rawImport.Transaction_ID} already exists, skipping`);
                }
              } catch (error) {
                console.error('Error processing row:', row, error);
                toast.error(`Failed to process transaction ${row.Transaction_ID}`);
              }
            }

            await queryClient.invalidateQueries({ queryKey: ['raw-payment-imports'] });
            toast.success('Raw data import completed');
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

  return {
    isUploading,
    importedData,
    headers,
    handleFileUpload,
    downloadTemplate
  };
};