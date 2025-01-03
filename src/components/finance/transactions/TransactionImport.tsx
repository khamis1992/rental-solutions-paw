import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const TransactionImport = () => {
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
          const transactionData = {
            agreement_number: columns[0],
            amount: columns[1], // Keep as string for database insert
            transaction_date: columns[2],
            payment_method: columns[3],
            status: columns[4],
            description: columns[5],
            transaction_id: columns[6],
          };

          const { error } = await supabase
            .from("accounting_transactions")
            .insert(transactionData);

          if (error) {
            console.error('Transaction import error:', error);
            toast.error('Failed to import transaction');
          }
        }

        toast.success('Transactions imported successfully');
      };
      
      reader.readAsText(file);
    } catch (error) {
      console.error('Import error:', error);
      toast.error("Failed to import transactions");
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
          Importing transactions...
        </div>
      )}
    </div>
  );
};