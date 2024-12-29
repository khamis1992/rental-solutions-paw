import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export const TransactionImport = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Set import flag when starting import
  useEffect(() => {
    if (isUploading || isAnalyzing) {
      sessionStorage.setItem('importInProgress', 'true');
    } else {
      sessionStorage.removeItem('importInProgress');
    }
    
    // Cleanup on unmount
    return () => {
      sessionStorage.removeItem('importInProgress');
    };
  }, [isUploading, isAnalyzing]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "text/csv") {
      toast({
        title: "Invalid File Type",
        description: "Please upload a CSV file with the required headers",
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
        .invoke('analyze-transaction-import', {
          body: formData,
        });

      if (analysisError) throw analysisError;

      setAnalysisResult(aiAnalysis);
      toast({
        title: "Analysis Complete",
        description: "AI has analyzed your file. Please review the suggestions.",
      });
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to analyze file. Please ensure it follows the correct format.",
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
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const { data, error } = await supabase.functions
        .invoke('process-transaction-import', {
          body: formData,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Transactions have been imported successfully.",
      });
      
      // Refresh the transactions list
      await queryClient.invalidateQueries({ queryKey: ["transactions"] });
      
      setSelectedFile(null);
      setAnalysisResult(null);
      
    } catch (error: any) {
      console.error('Import error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to import transactions",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    const headers = [
      "Agreement Number",
      "Customer Name",
      "Amount",
      "License Plate",
      "Vehicle",
      "Payment Date",
      "Payment Method",
      "Payment Number",
      "Payment Description",
      "Type"
    ].join(",");
    
    const exampleData = [
      "AGR-202403-0001,John Doe,1000.00,ABC123,Toyota Camry,2024-03-20,Cash,PMT001,Monthly Payment,INCOME",
      "AGR-202403-0002,Jane Smith,500.00,XYZ789,Honda Civic,2024-03-21,WireTransfer,PMT002,Deposit Payment,INCOME"
    ].join("\n");
    
    const csvContent = `${headers}\n${exampleData}`;
    
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
        <Card>
          <CardHeader>
            <CardTitle>AI Analysis Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p>Total Rows: {analysisResult.totalRows}</p>
              <p>Valid Rows: {analysisResult.validRows}</p>
              <p>Invalid Rows: {analysisResult.invalidRows}</p>
              <p>Total Amount: ${analysisResult.totalAmount?.toFixed(2)}</p>
            </div>

            {analysisResult.issues?.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Issues Found:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {analysisResult.issues.map((issue: string, index: number) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Button
              onClick={handleImplementChanges}
              disabled={isUploading}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                'Import Transactions'
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {isUploading && !analysisResult && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Importing transactions...
        </div>
      )}
    </div>
  );
};
