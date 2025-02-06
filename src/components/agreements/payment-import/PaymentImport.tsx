import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { FileUploadSection } from "./components/FileUploadSection";
import { ImportTable } from "./components/ImportTable";
import Papa from 'papaparse';

interface ImportedData {
  cheque_number: string;
  amount: string;
  payment_date: string;
  drawee_bank: string;
}

export const PaymentImport = ({ contractId }: { contractId: string }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [importedData, setImportedData] = useState<ImportedData[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const downloadTemplate = () => {
    const csvContent = [
      'cheque_number,amount,payment_date,drawee_bank',
      '1234,5000,2024-03-01,Qatar National Bank'
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'payment_template.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setIsAnalyzing(true);
    let successCount = 0;
    let errorCount = 0;
    
    try {
      const text = await file.text();
      
      Papa.parse<ImportedData>(text, {
        header: true,
        complete: async (results) => {
          const parsedData = results.data;
          setHeaders(results.meta.fields || []);
          setImportedData(parsedData);
          
          for (const row of parsedData) {
            try {
              // First check if cheque number exists
              const { data: existingCheque, error: checkError } = await supabase
                .from('car_installment_payments')
                .select('cheque_number')
                .eq('cheque_number', row.cheque_number)
                .maybeSingle();

              if (checkError) {
                console.error('Error checking cheque:', checkError);
                errorCount++;
                continue;
              }

              if (existingCheque) {
                toast.error(`Cheque number ${row.cheque_number} already exists`);
                errorCount++;
                continue;
              }

              // Validate required fields
              if (!row.cheque_number || !row.amount || !row.payment_date || !row.drawee_bank) {
                toast.error(`Missing required fields for cheque ${row.cheque_number || 'unknown'}`);
                errorCount++;
                continue;
              }

              // Insert new payment without ON CONFLICT
              const { error: insertError } = await supabase
                .from('car_installment_payments')
                .insert({
                  contract_id: contractId,
                  cheque_number: row.cheque_number,
                  amount: parseFloat(row.amount),
                  payment_date: row.payment_date,
                  drawee_bank: row.drawee_bank,
                  paid_amount: 0,
                  remaining_amount: parseFloat(row.amount),
                  status: 'pending'
                });

              if (insertError) {
                console.error('Insert error:', insertError);
                toast.error(`Failed to import cheque ${row.cheque_number}`);
                errorCount++;
              } else {
                successCount++;
              }
            } catch (error: any) {
              console.error('Error processing row:', error);
              errorCount++;
              toast.error(error.message || 'Failed to process row');
            }
          }

          await queryClient.invalidateQueries({ queryKey: ['car-installment-payments'] });
          toast.success(`Import completed: ${successCount} successful, ${errorCount} failed`);
        },
        error: (error) => {
          console.error('CSV Parse Error:', error);
          toast.error('Failed to parse CSV file');
        }
      });
    } catch (error: any) {
      console.error('Import error:', error);
      toast.error(error.message || 'Failed to import file');
    } finally {
      setIsAnalyzing(false);
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <FileUploadSection
        onFileUpload={handleFileUpload}
        onDownloadTemplate={downloadTemplate}
        isUploading={isUploading}
        isAnalyzing={isAnalyzing}
      />
      
      {importedData.length > 0 && (
        <ImportTable headers={headers} data={importedData} />
      )}
    </div>
  );
};