import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSession } from '@supabase/auth-helpers-react';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import { supabase } from "@/integrations/supabase/client";

const CSV_TEMPLATE_CONTENT = "Amount,Payment_Date,Payment_Method,Status,Description,Transaction_ID,Lease_ID\n" +
                           "1000,20-03-2024,credit_card,completed,Monthly payment for March,INV001,lease-uuid-here";

export const TransactionImport = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [importedData, setImportedData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const queryClient = useQueryClient();
  const session = useSession();
  const navigate = useNavigate();

  if (!session) {
    navigate('/auth');
    return null;
  }

  const downloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE_CONTENT], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'transaction_import_template.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      // Parse CSV file immediately to display data
      Papa.parse(file, {
        header: true,
        complete: async (results) => {
          const headers = results.meta.fields || [];
          setHeaders(headers);
          setImportedData(results.data);

          // Store raw data in Supabase
          try {
            const { error: insertError } = await supabase
              .from('raw_transaction_imports')
              .insert({
                raw_data: JSON.stringify(results.data),
                is_valid: true
              });

            if (insertError) {
              console.error('Raw data import error:', insertError);
              toast.error('Failed to store raw data');
            } else {
              toast.success('Data imported successfully');
              await queryClient.invalidateQueries({ queryKey: ["imported-transactions"] });
            }
          } catch (error) {
            console.error('Database error:', error);
            toast.error('Failed to store data in database');
          }
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
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Transactions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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

        {importedData.length > 0 && (
          <div className="rounded-md border mt-4">
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
        )}
      </CardContent>
    </Card>
  );
};