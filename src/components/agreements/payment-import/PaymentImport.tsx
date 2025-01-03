import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Papa from 'papaparse';
import { RawPaymentImport } from "@/components/finance/types/transaction.types";
import { FileUploadSection } from "./components/FileUploadSection";
import { REQUIRED_FIELDS, validateHeaders, normalizePaymentMethod } from "./utils/paymentUtils";

export const PaymentImport = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [importedData, setImportedData] = useState<Record<string, unknown>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const queryClient = useQueryClient();

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
            const parsedData = results.data as Record<string, unknown>[];
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

  return (
    <div className="space-y-4">
      <FileUploadSection
        onFileUpload={handleFileUpload}
        onDownloadTemplate={downloadTemplate}
        isUploading={isUploading}
      />
      
      {importedData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Imported Raw Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {headers.map((header) => (
                      <TableHead key={header}>{header}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {importedData.map((row, index) => (
                    <TableRow key={index}>
                      {headers.map((header) => (
                        <TableCell key={`${index}-${header}`}>
                          {String(row[header])}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};