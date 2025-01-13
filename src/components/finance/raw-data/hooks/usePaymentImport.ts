import { useState } from 'react';
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import Papa from 'papaparse';
import { validateHeaders, REQUIRED_FIELDS } from "../../types/transaction.types";

export const usePaymentImport = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [importedData, setImportedData] = useState<Record<string, unknown>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const downloadTemplate = () => {
    const csvContent = [
      REQUIRED_FIELDS.join(','),
      '1000,AGR-202401-0001,John Doe,ABC123,1000,cash,Monthly payment,25/01/2024,INCOME,pending'
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

            const batchId = crypto.randomUUID();

            for (const row of parsedData) {
              try {
                const { error: insertError } = await supabase
                  .from('unified_import_tracking')
                  .insert({
                    transaction_id: row.transaction_id as string,
                    agreement_number: row.agreement_number as string,
                    customer_name: row.customer_name as string,
                    license_plate: row.license_plate as string,
                    amount: Number(row.amount),
                    payment_method: row.payment_method as string,
                    description: row.description as string,
                    payment_date: row.payment_date as string,
                    type: row.type as string,
                    status: 'pending',
                    validation_status: false,
                    processing_attempts: 0,
                    batch_id: batchId,
                    import_source: 'csv',
                    file_name: file.name
                  });

                if (insertError) {
                  console.error('Import error:', insertError);
                  toast.error(`Failed to import row for transaction ${row.transaction_id}`);
                }
              } catch (error) {
                console.error('Error processing row:', row, error);
                toast.error(`Failed to process transaction ${row.transaction_id}`);
              }
            }

            await queryClient.invalidateQueries({ queryKey: ['unified-import-tracking'] });
            toast.success('Data imported successfully');
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