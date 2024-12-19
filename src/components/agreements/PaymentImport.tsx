import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      // First, analyze the file with AI
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
      
      // Upload file to storage
      const fileName = await uploadImportFile(selectedFile);
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
            
            // Reset states
            setSelectedFile(null);
            setAnalysisResult(null);
            
            // Force refresh the queries
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
      <div className="flex items-center gap-4">
        <Input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          disabled={isUploading || isAnalyzing}
        />
        <Button
          variant="outline"
          onClick={downloadTemplate}
          disabled={isUploading || isAnalyzing}
        >
          Download Template
        </Button>
      </div>
      
      {isAnalyzing && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Analyzing file with AI...
        </div>
      )}

      {analysisResult && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>AI Analysis Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Summary:</h4>
              <p>{analysisResult.summary}</p>
            </div>
            
            {analysisResult.warnings?.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-yellow-600">Warnings:</h4>
                <ul className="list-disc pl-4 space-y-1">
                  {analysisResult.warnings.map((warning: string, index: number) => (
                    <li key={index} className="text-sm">{warning}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {analysisResult.suggestions?.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-blue-600">Suggestions:</h4>
                <ul className="list-disc pl-4 space-y-1">
                  {analysisResult.suggestions.map((suggestion: string, index: number) => (
                    <li key={index} className="text-sm">{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}

            <Button
              onClick={handleImplementChanges}
              disabled={isUploading}
              className="w-full mt-4"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Implementing Changes...
                </>
              ) : (
                'Implement Changes'
              )}
            </Button>
          </CardContent>
        </Card>
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