import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { 
  analyzeImportFile,
  processImportFile,
  createImportLog,
  pollImportStatus
} from "../services/importService";
import { parseImportErrors } from "../utils/importUtils";

export const useImportProcess = () => {
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
        description: "Please upload a CSV file with the required headers",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    setIsAnalyzing(true);
    
    try {
      console.log('Starting file analysis...');
      const aiAnalysis = await analyzeImportFile(file);
      console.log('Analysis completed:', aiAnalysis);
      setAnalysisResult(aiAnalysis);
      toast({
        title: "Analysis Complete",
        description: "AI has analyzed your file. Please review the suggestions.",
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Error",
        description: "Failed to analyze file. Make sure it follows the correct format.",
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
      console.log('Starting implementation of changes...');
      const fileName = `${crypto.randomUUID()}.${selectedFile.name.split('.').pop()}`;
      
      // Upload file to storage
      console.log('Uploading file to storage:', fileName);
      await processImportFile(selectedFile, fileName);
      
      // Create import log
      console.log('Creating import log...');
      await createImportLog(fileName);

      let completed = false;
      let attempts = 0;
      const maxAttempts = 15; // 30 seconds total (15 attempts * 2 second interval)

      const pollInterval = setInterval(async () => {
        if (completed || attempts >= maxAttempts) {
          clearInterval(pollInterval);
          if (!completed) {
            setIsUploading(false);
            toast({
              title: "Error",
              description: "Import timed out. Please try again.",
              variant: "destructive",
            });
          }
          return;
        }

        attempts++;
        console.log(`Polling attempt ${attempts}/${maxAttempts}`);

        try {
          const importLog = await pollImportStatus(fileName);
          console.log('Poll response:', importLog);
          
          if (importLog?.status === "completed") {
            completed = true;
            clearInterval(pollInterval);
            handleImportCompletion(importLog);
          } else if (importLog?.status === "error") {
            completed = true;
            clearInterval(pollInterval);
            throw new Error("Import failed");
          }
        } catch (error) {
          console.error('Polling error:', error);
          completed = true;
          clearInterval(pollInterval);
          handleImportError(error);
        }
      }, 2000);

    } catch (error: any) {
      console.error('Import process error:', error);
      handleImportError(error);
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
    setIsUploading(false);
    
    await queryClient.invalidateQueries({ queryKey: ["payment-history"] });
    await queryClient.invalidateQueries({ queryKey: ["payment-schedules"] });
  };

  const handleImportError = (error?: any) => {
    setIsUploading(false);
    toast({
      title: "Error",
      description: error?.message || "Failed to process import",
      variant: "destructive",
    });
  };

  return {
    isUploading,
    isAnalyzing,
    analysisResult,
    selectedFile,
    handleFileUpload,
    handleImplementChanges,
  };
};