import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PaymentReconciliationTable } from "./PaymentReconciliationTable";
import { supabase } from "@/integrations/supabase/client";

export const PaymentReconciliation = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "text/csv") {
      toast({
        title: "Error",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      // Upload file to storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("imports")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Process the file using our Edge Function
      const { data: functionResponse, error: functionError } = await supabase.functions
        .invoke('process-payment-reconciliation', {
          body: { fileName }
        });

      if (functionError) throw functionError;

      toast({
        title: "Success",
        description: `Successfully processed ${functionResponse.processed} payments`,
      });

      // Refresh the data
      await queryClient.invalidateQueries({ queryKey: ["payment-reconciliation"] });
    } catch (error: any) {
      console.error('Payment reconciliation error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Payment Reconciliation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
            {isUploading && (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processing payments...</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <PaymentReconciliationTable />
    </div>
  );
};