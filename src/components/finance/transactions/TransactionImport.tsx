import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

export const PaymentImport = () => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result as string;
        const rows = text.split('\n').slice(1); // Skip header row

        for (const row of rows) {
          const columns = row.split(',');
          const paymentData = {
            Transaction_ID: columns[0],
            Agreement_Number: columns[1],
            Customer_Name: columns[2],
            License_Plate: columns[3],
            Amount: parseFloat(columns[4]),
            Payment_Method: columns[5],
            Description: columns[6],
            Payment_Date: columns[7],
            Type: columns[8],
            Status: columns[9],
          };

          const { error } = await supabase
            .from("raw_payment_imports")
            .insert(paymentData);

          if (error) {
            console.error('Raw data import error:', error);
            toast.error('Failed to store raw data');
          }
        }

        toast.success('Raw data imported successfully');
      };
      
      reader.readAsText(file);
    } catch (error) {
      console.error('Import error:', error);
      toast.error("Failed to import payment data");
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
          onClick={() => {}}
          disabled={isUploading}
        >
          Download Template
        </Button>
      </div>
      
      {isUploading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Importing payments...
        </div>
      )}
    </div>
  );
};
