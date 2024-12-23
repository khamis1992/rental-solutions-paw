import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { FileUploadSection } from "./components/FileUploadSection";
import { 
  uploadImportFile, 
  createImportLog, 
  processImport,
  pollImportStatus 
} from "./services/transactionImportService";

export const TransactionImport = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
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

    setIsAnalyzing(true);
    
    try {
      console.log('Starting file upload process...');
      const fileName = await uploadImportFile(file);
      console.log('File uploaded successfully:', fileName);

      await createImportLog(fileName);
      console.log('Import log created');

      const { data: functionResponse, error: functionError } = await processImport(fileName);

      if (functionError) {
        console.error('Edge Function error:', functionError);
        throw functionError;
      }

      console.log('Edge Function response:', functionResponse);

      const pollInterval = setInterval(async () => {
        try {
          const importLog = await pollImportStatus(fileName);

          if (importLog?.status === "completed") {
            clearInterval(pollInterval);
            toast({
              title: "Import Complete",
              description: `Successfully processed ${importLog.records_processed} transactions.`,
            });
            
            await queryClient.invalidateQueries({ queryKey: ["transactions"] });
            setIsAnalyzing(false);
          } else if (importLog?.status === "error") {
            clearInterval(pollInterval);
            throw new Error("Import failed");
          }
        } catch (error) {
          console.error('Polling error:', error);
          clearInterval(pollInterval);
          setIsAnalyzing(false);
          toast({
            title: "Error",
            description: "Failed to check import status",
            variant: "destructive",
          });
        }
      }, 2000);

      setTimeout(() => {
        clearInterval(pollInterval);
        if (isAnalyzing) {
          setIsAnalyzing(false);
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
      setIsAnalyzing(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = "Date,Amount,Description,Category,Customer\n" +
                      "2024-03-20,1000.00,Monthly Revenue,Income,Customer Name";
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'transaction_import_template.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-4">
      <FileUploadSection
        onFileUpload={handleFileUpload}
        onDownloadTemplate={downloadTemplate}
        isUploading={isUploading}
        isAnalyzing={isAnalyzing}
      />

      {isAnalyzing && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Processing import...
        </div>
      )}
    </div>
  );
};