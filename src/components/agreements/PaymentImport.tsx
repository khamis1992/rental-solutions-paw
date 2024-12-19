import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { FileUploadSection } from "./payment-import/FileUploadSection";
import { AIAnalysisCard } from "./payment-import/AIAnalysisCard";
import { 
  uploadImportFile, 
  createImportLog, 
  processImport,
  pollImportStatus 
} from "./services/agreementImportService";
import { parseImportErrors } from "./utils/importUtils";

export const PaymentImport = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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

    setSelectedFile(file);
    setIsAnalyzing(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const { data: aiAnalysis, error: analysisError } = await supabase.functions
        .invoke('analyze-payment-import', {
          body: formData
        });

      if (analysisError) throw analysisError;

      setAnalysisResult(aiAnalysis);
      toast({
        title: "Analysis Complete",
        description: "AI has analyzed your file. Please review the suggestions.",
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Error",
        description: "Failed to analyze file",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImplementChanges = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    try {
      console.log('Starting file upload process...');
      
      const fileName = await uploadImportFile(selectedFile);
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
        console.log('Checking import status...');
        try {
          const importLog = await pollImportStatus(fileName);

          if (importLog?.status === "completed") {
            clearInterval(pollInterval);
            
            const errors = importLog.errors ? parseImportErrors(importLog.errors) : null;
            
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
            
            setSelectedFile(null);
            setAnalysisResult(null);
            
            await queryClient.invalidateQueries({ queryKey: ["payment-history"] });
            await queryClient.invalidateQueries({ queryKey: ["payment-schedules"] });
            
          } else if (importLog?.status === "error") {
            clearInterval(pollInterval);
            throw new Error("Import failed");
          }
        } catch (error) {
          console.error('Polling error:', error);
          clearInterval(pollInterval);
          toast({
            title: "Error",
            description: "Failed to check import status",
            variant: "destructive",
          });
        }
      }, 2000);

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
    } finally {
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
      <FileUploadSection
        onFileUpload={handleFileUpload}
        onDownloadTemplate={downloadTemplate}
        isUploading={isUploading}
        isAnalyzing={isAnalyzing}
      />
      
      {analysisResult && (
        <AIAnalysisCard
          analysisResult={analysisResult}
          onImplementChanges={handleImplementChanges}
          isUploading={isUploading}
        />
      )}

      {isUploading && !analysisResult && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Importing payments...
        </div>
      )}
    </div>
  );
};