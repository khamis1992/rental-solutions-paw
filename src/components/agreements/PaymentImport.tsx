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

  const validateRow = (row: any, rowIndex: number): string[] => {
    const errors: string[] = [];
    
    REQUIRED_FIELDS.forEach(field => {
      if (!row[field] || row[field].trim() === '') {
        errors.push(`Row ${rowIndex + 1}: Missing required field "${field}"`);
      }
    });

    // Validate Amount is a number
    if (row.Amount && isNaN(parseFloat(row.Amount))) {
      errors.push(`Row ${rowIndex + 1}: Amount must be a valid number`);
    }

    // Validate Payment_Date format (DD-MM-YYYY)
    if (row.Payment_Date && !/^\d{2}-\d{2}-\d{4}$/.test(row.Payment_Date)) {
      errors.push(`Row ${rowIndex + 1}: Payment_Date must be in DD-MM-YYYY format`);
    }

    return errors;
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

            // Validate each row
            const allErrors: string[] = [];
            results.data.forEach((row: any, index: number) => {
              const rowErrors = validateRow(row, index);
              allErrors.push(...rowErrors);
            });

            if (allErrors.length > 0) {
              toast.error(
                <div>
                  <p>Validation errors found:</p>
                  <ul className="list-disc pl-4 mt-2">
                    {allErrors.slice(0, 3).map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                    {allErrors.length > 3 && (
                      <li>...and {allErrors.length - 3} more errors</li>
                    )}
                  </ul>
                </div>
              );
              setIsUploading(false);
              return;
            }

            setHeaders(headers);
            setImportedData(results.data);

            // Store raw data in Supabase with proper typing
            const { error: insertError } = await supabase
              .from('raw_transaction_imports')
              .insert({
                raw_data: JSON.parse(JSON.stringify(results.data)),
                is_valid: true,
                created_at: new Date().toISOString()
              });

            if (insertError) {
              console.error('Import error:', insertError);
              toast.error('Failed to store imported data');
            } else {
              toast.success('Data imported successfully');
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
                          {row[header]}
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