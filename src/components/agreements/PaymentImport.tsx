import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileUploadSection } from "./payment-import/components/FileUploadSection";
import { AIAnalysisCard } from "./payment-import/components/AIAnalysisCard";
import { ImportProgress } from "./payment-import/components/ImportProgress";
import { 
  uploadImportFile, 
  createImportLog, 
  processImport,
  pollImportStatus 
} from "./payment-import/services/importService";
import { parseImportErrors, validateCsvFile } from "./payment-import/utils/importUtils";

export const PaymentImport = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!validateCsvFile(file)) {
      toast({
        title: "Error",
        description: "Please upload a CSV file with the following headers: Amount, Payment_Date, Payment_Method, Status, Lease_ID",
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
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          }
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
        description: "Failed to analyze file. Make sure the CSV includes a Lease_ID column.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImplementChanges = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    setProgress(0);
    try {
      const fileName = await uploadImportFile(selectedFile);
      await createImportLog(fileName);
      const { error: functionError } = await processImport(fileName);

      if (functionError) throw functionError;

      const pollInterval = setInterval(async () => {
        try {
          const importLog = await pollImportStatus(fileName);
          
          if (importLog?.status === "completed") {
            clearInterval(pollInterval);
            handleImportCompletion(importLog);
          } else if (importLog?.status === "error") {
            throw new Error("Import failed");
          } else if (importLog?.records_processed) {
            setProgress(Math.min((importLog.records_processed / 100) * 90, 90));
          }
        } catch (error) {
          handleImportError(error, pollInterval);
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
      setIsUploading(false);
    }
  };

  const handleImportCompletion = async (importLog: any) => {
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
    setProgress(100);
    
    await queryClient.invalidateQueries({ queryKey: ["payment-history"] });
    await queryClient.invalidateQueries({ queryKey: ["payment-schedules"] });
    setIsUploading(false);
  };

  const handleImportError = (error: any, pollInterval: NodeJS.Timer) => {
    console.error('Polling error:', error);
    clearInterval(pollInterval);
    toast({
      title: "Error",
      description: "Failed to check import status",
      variant: "destructive",
    });
    setIsUploading(false);
  };

  const downloadTemplate = () => {
    const csvContent = "Amount,Payment_Date,Payment_Method,Status,Description,Transaction_ID,Lease_ID\n" +
                      "1000,20-03-2024,credit_card,completed,Monthly payment for March,INV001,lease-uuid-here";
    
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

      <ImportProgress 
        isUploading={isUploading} 
        progress={progress}
      />
    </div>
  );
};