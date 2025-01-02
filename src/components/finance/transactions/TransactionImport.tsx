import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from '@supabase/auth-helpers-react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { ImportedPaymentData, ValidationResult, RawPaymentImport } from "../types/payment.types";

const REQUIRED_FIELDS = [
  'Amount',
  'Payment_Date',
  'Payment_Method',
  'Status',
  'Description',
  'Transaction_ID',
  'Lease_ID'
] as const;

// Moved outside component to prevent recreation
const validateHeaders = (headers: string[]): ValidationResult => {
  const normalizedHeaders = headers.map(h => h.trim());
  const missingFields = REQUIRED_FIELDS.filter(
    field => !normalizedHeaders.includes(field)
  );
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
};

// Template content moved outside to prevent recreation
const EXCEL_TEMPLATE_DATA = [
  ['Amount', 'Payment_Date', 'Payment_Method', 'Status', 'Description', 'Transaction_ID', 'Lease_ID'],
  [1000, '20-03-2024', 'credit_card', 'completed', 'Monthly payment for March', 'INV001', 'lease-uuid-here']
];

export const TransactionImport = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [importedData, setImportedData] = useState<ImportedPaymentData[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const queryClient = useQueryClient();
  const session = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!session) {
      navigate('/auth');
    }
  }, [session, navigate]);

  const downloadTemplate = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(EXCEL_TEMPLATE_DATA);
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, 'payment_import_template.xlsx');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!session) {
      toast.error('Please sign in to upload files');
      return;
    }

    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = e.target?.result;
        if (!data) {
          throw new Error('Invalid file content');
        }
        
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Get headers from the first row
        const headers = Object.keys(jsonData[0] || {});
        const headerValidation = validateHeaders(headers);

        if (!headerValidation.isValid) {
          toast.error(`Missing required columns: ${headerValidation.missingFields.join(', ')}`);
          setIsUploading(false);
          return;
        }

        setHeaders(headers);
        const parsedData = jsonData as ImportedPaymentData[];
        setImportedData(parsedData);

        const rawImport: RawPaymentImport = {
          raw_data: JSON.stringify(parsedData),
          is_valid: true,
          created_at: new Date().toISOString()
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
      };
      
      reader.readAsBinaryString(file);
    } catch (error) {
      if (error instanceof Error) {
        console.error('Import error:', error);
        toast.error(error.message || 'Failed to import file');
      }
    } finally {
      setIsUploading(false);
    }
  };

  if (!session) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Transactions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Input
            type="file"
            accept=".xlsx,.xls"
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
            Importing transactions...
          </div>
        )}

        {importedData.length > 0 && (
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr>
                  {headers.map((header) => (
                    <th key={header} className="p-2 text-left">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {importedData.map((row, index) => (
                  <tr key={index}>
                    {headers.map((header) => (
                      <td key={`${index}-${header}`} className="p-2">
                        {String(row[header as keyof ImportedPaymentData])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};