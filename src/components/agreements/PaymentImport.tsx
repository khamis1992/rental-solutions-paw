import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { retryOperation } from "./utils/retryUtils";

export const PaymentImport = () => {
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
      console.log('Starting file upload process...');
      const fileExt = file.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      
      console.log('Uploading file to storage:', fileName);
      const { error: uploadError } = await supabase.storage
        .from("imports")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw uploadError;
      }

      // Read and log the CSV content before processing
      const content = await file.text();
      const lines = content.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      console.log('CSV Headers:', headers);
      console.log('Total rows to process:', lines.length - 1);

      console.log('File uploaded successfully, creating import log...');
      const { error: logError } = await supabase
        .from("import_logs")
        .insert({
          file_name: fileName,
          import_type: "payments",
          status: "pending",
        });

      if (logError) {
        console.error('Import log creation error:', logError);
        throw logError;
      }

      console.log('Starting import process via Edge Function...');
      const { data: functionResponse, error: functionError } = await supabase.functions
        .invoke('process-payment-import', {
          body: { fileName }
        });

      if (functionError) {
        console.error('Edge Function error:', functionError);
        throw functionError;
      }

      console.log('Edge Function response:', functionResponse);

      // Poll for import completion
      const pollInterval = setInterval(async () => {
        console.log('Checking import status...');
        try {
          const { data: importLog } = await supabase
            .from("import_logs")
            .select("status, records_processed, errors")
            .eq("file_name", fileName)
            .single();

          if (importLog?.status === "completed") {
            clearInterval(pollInterval);
            
            // Show detailed import results
            const skippedRecords = importLog.errors?.skipped || [];
            const failedRecords = importLog.errors?.failed || [];
            
            let description = `Successfully processed ${importLog.records_processed} payments.`;
            if (skippedRecords.length > 0) {
              description += ` ${skippedRecords.length} records were skipped due to missing data.`;
            }
            if (failedRecords.length > 0) {
              description += ` ${failedRecords.length} records failed to process.`;
            }

            toast({
              title: "Import Complete",
              description: description,
            });
            
            // Force refresh the queries
            await queryClient.invalidateQueries({ queryKey: ["payment-history"] });
            await queryClient.invalidateQueries({ queryKey: ["payment-schedules"] });
            
            setIsUploading(false);
          } else if (importLog?.status === "error") {
            clearInterval(pollInterval);
            throw new Error("Import failed");
          }
        } catch (error) {
          console.error('Polling error:', error);
          clearInterval(pollInterval);
          setIsUploading(false);
          toast({
            title: "Error",
            description: "Failed to check import status",
            variant: "destructive",
          });
        }
      }, 2000);

      // Set a timeout to stop polling after 30 seconds
      setTimeout(() => {
        clearInterval(pollInterval);
        if (isUploading) {
          setIsUploading(false);
          toast({
            title: "Error",
            description: "Import timed out. Please try again.",
            variant: "destructive",
          });
        }
      }, 30000);

    } catch (error: any) {
      console.error('Import process error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process import",
        variant: "destructive",
      });
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = "Customer Name,Amount,Payment_Date,Payment_Method,status,Payment_Number,Payment_Description\n" +
                      "John Doe,1000,20-03-2024,credit_card,completed,INV001,Monthly payment";
    
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