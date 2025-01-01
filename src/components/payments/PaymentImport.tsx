import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ImportErrorAnalysis } from "@/components/finance/import/ImportErrorAnalysis";

export const PaymentImport = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importErrors, setImportErrors] = useState<any[]>([]);
  const queryClient = useQueryClient();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setIsUploading(true);
    setProgress(0);
    setImportErrors([]);

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
      const { data, error: functionError } = await supabase.functions
        .invoke('process-payment-import', {
          body: { 
            fileName,
            batchSize: 50,
            maxRetries: 3
          }
        });

      if (functionError) throw functionError;

      if (data.errors?.length > 0) {
        setImportErrors(data.errors);
        toast.error(`Imported ${data.successCount} payments with ${data.errors.length} errors`);
      } else {
        toast.success(`Successfully imported ${data.successCount} payments`);
      }
      
      // Force refresh the queries
      await queryClient.invalidateQueries({ queryKey: ["payments"] });
      await queryClient.invalidateQueries({ queryKey: ["payment-history"] });
      
      setProgress(100);
    } catch (error: any) {
      console.error('Import process error:', error);
      toast.error(error.message || "Failed to process import");
      setProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    toast.success("Suggestion copied! Paste it in the chat to get help implementing it.");
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

      {importErrors.length > 0 && (
        <ImportErrorAnalysis 
          errors={importErrors}
          onSuggestionClick={handleSuggestionClick}
        />
      )}
    </div>
  );
};