import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Upload, FileDown, PlayCircle, Trash2 } from "lucide-react";
import Papa from 'papaparse';
import { normalizePaymentMethod, validateHeaders, formatDateForDB, REQUIRED_FIELDS } from "./payment-import/utils/paymentUtils";
import { usePaymentAssignment } from "./payment-import/hooks/usePaymentAssignment";

type ImportedData = Record<string, unknown>;

export const PaymentImport = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [importedData, setImportedData] = useState<ImportedData[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const queryClient = useQueryClient();
  const { isAssigning, forceAssignAllPayments } = usePaymentAssignment();

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
            const { isValid, missingFields } = validateHeaders(headers);

            if (!isValid) {
              toast.error(`Missing required columns: ${missingFields.join(', ')}`);
              setIsUploading(false);
              return;
            }

            setHeaders(headers);
            const parsedData = results.data as ImportedData[];
            setImportedData(parsedData);

            const batchId = crypto.randomUUID();

            for (const [index, row] of parsedData.entries()) {
              try {
                const formattedDate = formatDateForDB(row.payment_date as string);
                if (!formattedDate) {
                  toast.error(`Invalid date format for transaction ${row.transaction_id}: ${row.payment_date}`);
                  continue;
                }

                const { error: insertError } = await supabase
                  .from('unified_import_tracking')
                  .insert({
                    transaction_id: row.transaction_id as string,
                    agreement_number: row.agreement_number as string,
                    customer_name: row.customer_name as string,
                    license_plate: row.license_plate as string,
                    amount: Number(row.amount),
                    payment_method: normalizePaymentMethod(row.payment_method as string),
                    description: row.description as string,
                    payment_date: formattedDate,
                    type: row.type as string,
                    status: 'pending',
                    batch_id: batchId,
                    row_number: index + 1,
                    file_name: file.name
                  });

                if (insertError) {
                  console.error('Import tracking error:', insertError);
                  toast.error(`Failed to track import for transaction ${row.transaction_id}`);
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

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Import Payment Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={isUploading || isAssigning}
                className="cursor-pointer"
              />
              <Upload className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={downloadTemplate}
                disabled={isUploading || isAssigning}
                className="whitespace-nowrap"
              >
                <FileDown className="mr-2 h-4 w-4" />
                Download Template
              </Button>
              <Button
                variant="default"
                onClick={forceAssignAllPayments}
                disabled={isUploading || isAssigning}
                className="whitespace-nowrap"
              >
                <PlayCircle className="mr-2 h-4 w-4" />
                Process All
              </Button>
            </div>
          </div>
          
          {(isUploading || isAssigning) && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              {isUploading ? 'Uploading file...' : 'Processing payments...'}
            </div>
          )}
        </CardContent>
      </Card>

      {importedData.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Imported Raw Data</CardTitle>
            <div className="text-sm text-muted-foreground">
              {importedData.length} records imported
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {headers.map((header) => (
                      <TableHead key={header} className="whitespace-nowrap">
                        {header}
                      </TableHead>
                    ))}
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {importedData.map((row, index) => (
                    <TableRow key={index}>
                      {headers.map((header) => (
                        <TableCell key={`${index}-${header}`} className="whitespace-nowrap">
                          {String(row[header])}
                        </TableCell>
                      ))}
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            // Delete functionality will be handled here
                            toast.error('Delete functionality coming soon');
                          }}
                          className="h-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
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