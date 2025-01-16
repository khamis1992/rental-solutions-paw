import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Upload } from "lucide-react";
import Papa from 'papaparse';

export const PaymentImport = () => {
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

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
            const batchId = crypto.randomUUID();

            for (const row of results.data as any[]) {
              try {
                const { error: insertError } = await supabase
                  .from('unified_import_tracking')
                  .insert({
                    transaction_id: row.transaction_id,
                    agreement_number: row.agreement_number,
                    customer_name: row.customer_name,
                    license_plate: row.license_plate,
                    amount: Number(row.amount),
                    payment_method: row.payment_method,
                    description: row.description,
                    payment_date: row.payment_date,
                    type: row.type || 'Income',
                    batch_id: batchId
                  });

                if (insertError) {
                  console.error('Import error:', insertError);
                  toast.error(`Failed to import row for transaction ${row.transaction_id}`);
                }
              } catch (error) {
                console.error('Error processing row:', row, error);
                toast.error(`Failed to process transaction ${row.transaction_id}`);
              }
            }

            await queryClient.invalidateQueries({ queryKey: ['payment-history'] });
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
    <div className="flex items-center gap-4">
      <Input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        disabled={isUploading}
        className="max-w-xs"
      />
      {isUploading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Importing payments...
        </div>
      )}
    </div>
  );
};