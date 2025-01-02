import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import Papa from 'papaparse';
import { AccountingTransaction } from "../../finance/types/transaction.types";

const REQUIRED_FIELDS = [
  'Amount',
  'Payment_Date',
  'Payment_Method',
  'Status',
  'Description',
  'Transaction_ID',
  'Lease_ID'
] as const;

type ImportedData = Record<string, string>;

export const PaymentImport = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [importedData, setImportedData] = useState<ImportedData[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
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
            const parsedData = results.data as ImportedData[];
            setImportedData(parsedData);

            const transformedData: Partial<AccountingTransaction>[] = parsedData.map(row => ({
              amount: row.Amount,
              transaction_date: row.Payment_Date,
              payment_method: row.Payment_Method,
              status: row.Status,
              description: row.Description,
              transaction_id: row.Transaction_ID,
              agreement_number: row.Lease_ID
            }));

            const { error: insertError } = await supabase
              .from('accounting_transactions')
              .insert(transformedData);

            if (insertError) {
              console.error('Data import error:', insertError);
              toast.error('Failed to store data');
            } else {
              toast.success('Data imported successfully');
              await queryClient.invalidateQueries({ queryKey: ['transactions'] });
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
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Importing data...
        </div>
      )}

      {importedData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Imported Data</CardTitle>
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
                          {String(row[header] || '')}
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