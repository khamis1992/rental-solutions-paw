import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { ImportErrors } from "./utils/importTypes";
import { parseImportErrors } from "./utils/importUtils";
import { 
  uploadImportFile, 
  createImportLog, 
  processImport,
  pollImportStatus 
} from "./services/agreementImportService";

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
      
      // Upload file to storage
      const fileName = await uploadImportFile(file);
      console.log('File uploaded successfully:', fileName);

      // Create import log
      await createImportLog(fileName);
      console.log('Import log created');

      // Process the import
      const { data: functionResponse, error: functionError } = await processImport(fileName);

      if (functionError) {
        console.error('Edge Function error:', functionError);
        throw functionError;
      }

      console.log('Edge Function response:', functionResponse);

      // Poll for import completion
      const pollInterval = setInterval(async () => {
        console.log('Checking import status...');
        try {
          const importLog = await pollImportStatus(fileName);

          if (importLog?.status === "completed") {
            clearInterval(pollInterval);
            
            // Parse errors object safely
            const errors = importLog.errors ? parseImportErrors(importLog.errors) : null;
            
            // Show detailed import results
            const skippedCount = errors?.skipped?.length ?? 0;
            const failedCount = errors?.failed?.length ?? 0;
            
            let description = `Successfully processed ${importLog.records_processed} payments.`;
            if (skippedCount > 0) {
              description += ` ${skippedCount} records were skipped due to missing data.`;
            }
            if (failedCount > 0) {
              description += ` ${failedCount} records failed to process.`;
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