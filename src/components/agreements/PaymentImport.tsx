import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import Papa from 'papaparse';
import { RawPaymentImport, PaymentMethodType } from "@/components/finance/types/transaction.types";
import { normalizePaymentMethod } from "@/components/finance/utils/paymentUtils";

const REQUIRED_FIELDS = [
  'Transaction_ID',
  'Agreement_Number',
  'Customer_Name',
  'License_Plate',
  'Amount',
  'Payment_Method',
  'Description',
  'Payment_Date',
  'Type',
  'Status'
] as const;

type ImportedData = Record<string, unknown>;

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

  const forceAssignPayment = async (payment: RawPaymentImport) => {
    try {
      // Get lease ID by agreement number
      const { data: lease } = await supabase
        .from('leases')
        .select('id')
        .eq('agreement_number', payment.Agreement_Number)
        .single();

      if (!lease) {
        toast.error(`No agreement found with number ${payment.Agreement_Number}`);
        return false;
      }

      // Insert payment directly
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          lease_id: lease.id,
          amount: payment.Amount,
          payment_method: payment.Payment_Method,
          payment_date: payment.Payment_Date,
          status: payment.Status,
          description: payment.Description,
          type: payment.Type
        });

      if (paymentError) {
        console.error('Payment insert error:', paymentError);
        toast.error(`Failed to create payment for agreement ${payment.Agreement_Number}`);
        return false;
      }

      // Mark raw payment as valid
      const { error: updateError } = await supabase
        .from('raw_payment_imports')
        .update({ is_valid: true })
        .eq('id', payment.id);

      if (updateError) {
        console.error('Update error:', updateError);
        return false;
      }

      toast.success(`Payment assigned to agreement ${payment.Agreement_Number}`);
      return true;
    } catch (error) {
      console.error('Force assign error:', error);
      toast.error('Failed to assign payment');
      return false;
    }
  };

  const forceAssignAllPayments = async () => {
    setIsUploading(true);
    try {
      const { data: unprocessedPayments, error: fetchError } = await supabase
        .from('raw_payment_imports')
        .select('*')
        .eq('is_valid', false);

      if (fetchError) throw fetchError;

      let successCount = 0;
      for (const payment of (unprocessedPayments || [])) {
        const success = await forceAssignPayment(payment);
        if (success) successCount++;
      }

      toast.success(`Successfully assigned ${successCount} payments`);
      await queryClient.invalidateQueries({ queryKey: ['raw-payment-imports'] });
    } catch (error) {
      console.error('Bulk assign error:', error);
      toast.error('Failed to assign payments');
    } finally {
      setIsUploading(false);
    }
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
                is_valid: false
              };

              const { error: insertError } = await supabase
                .from('raw_payment_imports')
                .insert(rawImport);

              if (insertError) {
                console.error('Raw data import error:', insertError);
                toast.error('Failed to store raw data');
              }
            }

            await queryClient.invalidateQueries({ queryKey: ['raw-payment-imports'] });
            toast.success('Raw data imported successfully');
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
        <Button
          variant="default"
          onClick={forceAssignAllPayments}
          disabled={isUploading}
        >
          Force Assign All
        </Button>
      </div>
      
      {isUploading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Processing payments...
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