import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Upload, FileDown, PlayCircle } from "lucide-react";

type ImportedData = Record<string, unknown>;

export const RawDataView = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importedData, setImportedData] = useState<ImportedData[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const downloadTemplate = () => {
    const csvContent = [
      'Transaction_ID,Agreement_Number,Customer_Name,License_Plate,Amount,Payment_Method,Description,Payment_Date,Type',
      '1000,AGR-202401-0001,John Doe,ABC123,1000,Cash,Monthly payment,25/01/2024,INCOME'
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
        const Papa = await import('papaparse');
        
        Papa.default.parse(text, {
          header: true,
          complete: (results) => {
            const headers = results.meta.fields || [];
            setHeaders(headers);
            setImportedData(results.data as ImportedData[]);
            toast.success('File imported successfully');
          },
          error: (error) => {
            console.error('CSV Parse Error:', error);
            toast.error('Failed to parse CSV file');
          }
        });
      };
      
      reader.readAsText(file);
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import file');
    } finally {
      setIsUploading(false);
    }
  };

  const processAll = async () => {
    setIsProcessing(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      const batchId = crypto.randomUUID();

      for (const row of importedData) {
        try {
          const { error: insertError } = await supabase
            .from('unified_import_tracking')
            .insert({
              transaction_id: row.Transaction_ID as string,
              agreement_number: row.Agreement_Number as string,
              customer_name: row.Customer_Name as string,
              license_plate: row.License_Plate as string,
              amount: Number(row.Amount),
              payment_method: row.Payment_Method as string,
              description: row.Description as string,
              payment_date: row.Payment_Date as string,
              type: row.Type as string,
              status: 'pending',
              validation_status: false,
              processing_attempts: 0,
              batch_id: batchId,
              import_source: 'csv',
              file_name: 'manual_import'
            });

          if (insertError) {
            console.error('Import error:', insertError);
            errorCount++;
          } else {
            successCount++;
          }
        } catch (error) {
          console.error('Error processing row:', error);
          errorCount++;
        }
      }

      await queryClient.invalidateQueries({ queryKey: ['unified-import-tracking'] });
      
      if (successCount > 0) {
        toast.success(`Successfully processed ${successCount} records`);
      }
      if (errorCount > 0) {
        toast.error(`Failed to process ${errorCount} records`);
      }
      
      // Clear the imported data after successful processing
      if (errorCount === 0) {
        setImportedData([]);
        setHeaders([]);
      }
    } catch (error) {
      console.error('Processing error:', error);
      toast.error('Failed to process records');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Raw Payment Import Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={isUploading || isProcessing}
                className="cursor-pointer"
              />
              <Upload className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={downloadTemplate}
                disabled={isUploading || isProcessing}
                className="whitespace-nowrap"
              >
                <FileDown className="mr-2 h-4 w-4" />
                Download Template
              </Button>
              <Button
                variant="default"
                onClick={processAll}
                disabled={isUploading || isProcessing || importedData.length === 0}
                className="whitespace-nowrap"
              >
                {isProcessing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <PlayCircle className="mr-2 h-4 w-4" />
                )}
                Process All
              </Button>
            </div>
          </div>
          
          {isUploading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading file...
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