import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const PaymentImport = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size must be less than 10MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setProgress(0);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      
      console.log('Starting file upload:', fileName);
      
      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from("imports")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      console.log('File uploaded successfully, creating import log');

      // Create import log
      const { error: logError } = await supabase
        .from("import_logs")
        .insert({
          file_name: fileName,
          import_type: "payments",
          status: "pending",
        });

      if (logError) throw logError;

      console.log('Import log created, starting processing');

      // Process the import
      const { error: functionError } = await supabase.functions
        .invoke('process-payment-import', {
          body: { 
            fileName,
            batchSize: 50, // Process 50 records at a time
            maxRetries: 3  // Retry failed operations up to 3 times
          }
        });

      if (functionError) throw functionError;

      // Poll for import completion
      let timeoutCounter = 0;
      const maxTimeout = 300; // 5 minutes maximum
      
      const pollInterval = setInterval(async () => {
        timeoutCounter++;
        
        if (timeoutCounter >= maxTimeout) {
          clearInterval(pollInterval);
          throw new Error("Import timed out after 5 minutes");
        }

        const { data: importLog } = await supabase
          .from("import_logs")
          .select("status, records_processed, errors")
          .eq("file_name", fileName)
          .single();

        console.log('Poll update:', importLog);

        if (importLog?.status === "completed") {
          clearInterval(pollInterval);
          
          // Check for any errors in the import
          const errors = importLog.errors ? JSON.parse(JSON.stringify(importLog.errors)) : null;
          const errorCount = errors ? (errors.failed?.length || 0) + (errors.skipped?.length || 0) : 0;
          
          const successMessage = errorCount > 0 
            ? `Imported ${importLog.records_processed} payments with ${errorCount} errors`
            : `Successfully imported ${importLog.records_processed} payments`;
          
          toast({
            title: "Success",
            description: successMessage,
          });
          
          // Force refresh the queries
          await queryClient.invalidateQueries({ queryKey: ["payments"] });
          await queryClient.invalidateQueries({ queryKey: ["payment-history"] });
          
          setIsUploading(false);
          setProgress(100);
        } else if (importLog?.status === "error") {
          clearInterval(pollInterval);
          throw new Error("Import failed");
        } else if (importLog?.records_processed) {
          // Update progress based on processed records
          const progressValue = Math.min((importLog.records_processed / 100) * 90, 90);
          setProgress(progressValue);
        }
      }, 2000); // Poll every 2 seconds

    } catch (error: any) {
      console.error('Import process error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process import",
        variant: "destructive",
      });
      setIsUploading(false);
      setProgress(0);
    }
  };

  const downloadTemplate = () => {
    const csvContent = "Customer Name,Amount,Payment_Date,Payment_Method,Status,Payment_Number,Payment_Description\n" +
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
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Importing payments...
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}
    </div>
  );
};