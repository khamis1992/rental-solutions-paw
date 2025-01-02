import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Papa from 'papaparse';
import { FileUpload } from "./FileUpload";
import { ImportTable } from "./ImportTable";
import { Json } from "@/integrations/supabase/types";

const REQUIRED_FIELDS = [
  'Amount',
  'Payment_Date',
  'Payment_Method',
  'Status',
  'Description',
  'Transaction_ID',
  'Lease_ID'
];

export const PaymentImport = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [importedData, setImportedData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);

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
    const csvContent = "Amount,Payment_Date,Payment_Method,Status,Description,Transaction_ID,Lease_ID\n" +
                      "1000,20-03-2024,credit_card,completed,Monthly payment for March,INV001,lease-uuid-here";
    
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
            setImportedData(results.data);

            // Store raw data in Supabase with proper typing
            const { error: insertError } = await supabase
              .from('raw_payment_imports')
              .insert({
                raw_data: results.data as Json,
                is_valid: true,
                created_at: new Date().toISOString()
              });

            if (insertError) {
              console.error('Raw data import error:', insertError);
              toast.error('Failed to store raw data');
            } else {
              toast.success('Raw data imported successfully');
            }
          },
          error: (error) => {
            console.error('CSV Parse Error:', error);
            toast.error('Failed to parse CSV file');
          }
        });
      };
      
      reader.readAsText(file);
    } catch (error: any) {
      console.error('Import error:', error);
      toast.error(error.message || 'Failed to import file');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <FileUpload
        onFileUpload={handleFileUpload}
        onDownloadTemplate={downloadTemplate}
        isUploading={isUploading}
      />
      <ImportTable headers={headers} data={importedData} />
    </div>
  );
};