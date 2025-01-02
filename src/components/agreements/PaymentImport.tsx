import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import Papa from 'papaparse';
import { Json } from "@/integrations/supabase/types";

const REQUIRED_FIELDS = [
  'Amount',
  'Payment_Date',
  'Payment_Method',
  'Status',
  'Description',
  'Transaction_ID',
  'Agreement_Number'
] as const;

type ImportedData = Record<string, unknown>;

export const PaymentImport = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [importedData, setImportedData] = useState<ImportedData[]>([]);
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

  const formatDateForDB = (dateStr: string): string => {
    // Check if date is in DD/MM/YYYY format
    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    if (dateRegex.test(dateStr)) {
      const [day, month, year] = dateStr.split('/');
      return `${year}-${month}-${day}`;
    }
    // If not in DD/MM/YYYY format, return as is (assuming it's already in YYYY-MM-DD)
    return dateStr;
  };

  const downloadTemplate = () => {
    const csvContent = REQUIRED_FIELDS.join(',') + '\n' +
                      '1000,14/12/2024,credit_card,completed,Monthly payment for March,INV001,AGR-001';
    
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
              const { error: insertError } = await supabase
                .from('raw_payment_imports')
                .insert({
                  Agreement_Number: row.Agreement_Number,
                  Transaction_ID: row.Transaction_ID,
                  Customer_Name: row.Customer_Name,
                  License_Plate: row.License_Plate,
                  Amount: parseFloat(row.Amount as string),
                  Payment_Method: row.Payment_Method,
                  Description: row.Description,
                  Payment_Date: formatDateForDB(row.Payment_Date as string),
                  Type: row.Type,
                  Status: row.Status,
                  is_valid: true
                });

              if (insertError) {
                console.error('Row insert error:', insertError);
                toast.error(`Failed to insert row: ${insertError.message}`);
              }
            }

            toast.success('Data imported successfully');
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