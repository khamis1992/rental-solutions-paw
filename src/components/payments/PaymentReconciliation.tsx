import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      
      console.log('Uploading file to storage:', fileName);
      const { error: uploadError } = await supabase.storage
        .from("imports")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      console.log('File uploaded successfully, processing payments...');
      
      // Process the file using Edge Function
      const { data: functionResponse, error: functionError } = await supabase.functions
        .invoke('process-payment-reconciliation', {
          body: { fileName }
        });

      if (functionError) throw functionError;

      console.log('Processing complete:', functionResponse);

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
        description: error.message || "Failed to process payments",
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
              className="max-w-md"
            />
            {isUploading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
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