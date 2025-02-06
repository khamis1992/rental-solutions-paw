import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUploadSection } from "@/components/agreements/payment-import/FileUploadSection";
import Papa from 'papaparse';

interface CsvRow {
  cheque_number: string;
  amount: string;
  payment_date: string;
  drawee_bank: string;
}

export const CarInstallmentDetails = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { data: payments, isLoading } = useQuery({
    queryKey: ["car-installment-payments", id],
    queryFn: async () => {
      console.log("Fetching payments for contract:", id);
      const { data, error } = await supabase
        .from("car_installment_payments")
        .select("*")
        .eq("contract_id", id)
        .order("payment_date", { ascending: true });

      if (error) {
        console.error("Error fetching payments:", error);
        throw error;
      }
      console.log("Fetched payments:", data);
      return data;
    },
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    
    try {
      const text = await file.text();
      
      Papa.parse<CsvRow>(text, {
        header: true,
        complete: async (results) => {
          const parsedData = results.data;
          
          for (const row of parsedData) {
            try {
              // Validate required fields
              if (!row.cheque_number || !row.amount || !row.payment_date || !row.drawee_bank) {
                throw new Error(`Missing required fields for cheque ${row.cheque_number || 'unknown'}`);
              }

              const { error: insertError } = await supabase
                .from('car_installment_payments')
                .insert({
                  contract_id: id,
                  cheque_number: row.cheque_number,
                  amount: parseFloat(row.amount),
                  payment_date: row.payment_date,
                  drawee_bank: row.drawee_bank,
                  paid_amount: 0,
                  remaining_amount: parseFloat(row.amount),
                  status: 'pending'
                })
                .select();

              if (insertError) {
                if (insertError.code === '23505') { // Unique violation
                  toast.error(`Cheque number ${row.cheque_number} already exists`);
                } else {
                  console.error('Import error:', insertError);
                  toast.error(`Failed to import cheque ${row.cheque_number}`);
                }
              }
            } catch (error: any) {
              console.error('Error processing row:', error);
              toast.error(error.message || 'Failed to process row');
            }
          }

          await queryClient.invalidateQueries({ queryKey: ['car-installment-payments'] });
          toast.success('Cheques imported successfully');
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
      setIsAnalyzing(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = [
      'cheque_number,amount,payment_date,drawee_bank',
      '1234,5000,2024-03-01,Qatar National Bank',
      '1235,5000,2024-04-01,Qatar National Bank'
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'car_installment_template.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Payment Installments</CardTitle>
        </CardHeader>
        <CardContent>
          <FileUploadSection
            onFileUpload={handleFileUpload}
            onDownloadTemplate={downloadTemplate}
            isUploading={isUploading}
            isAnalyzing={isAnalyzing}
          />
          
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cheque Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Drawee Bank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments?.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.cheque_number}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.payment_date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.drawee_bank}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};