import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Upload, AlertTriangle, CheckCircle, FileText } from "lucide-react";
import { analyzeCsvContent, generateErrorReport } from "./utils/csvAnalyzer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ImportAnalysisCard } from "./components/ImportAnalysisCard";
import { ImportActions } from "./components/ImportActions";
import { ImportErrorReport } from "./components/ImportErrorReport";

const REQUIRED_HEADERS = [
  "serial_number",
  "violation_number",
  "violation_date",
  "license_plate",
  "fine_location",
  "violation_charge",
  "fine_amount",
  "violation_points"
];

export const TrafficFineImport = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "text/csv") {
      toast({
        title: "Invalid File Type",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      console.log('Starting file analysis...');
      
      // Read and analyze the file
      const content = await file.text();
      const analysis = analyzeCsvContent(content, REQUIRED_HEADERS);
      setAnalysisResult(analysis);
      
      console.log('Analysis complete:', analysis);

      if (!analysis.isValid && analysis.validRows === 0) {
        toast({
          title: "Validation Failed",
          description: "No valid records found to import. Please review the analysis report.",
          variant: "destructive",
        });
        return;
      }

      // Proceed with upload if there are valid rows
      const fileName = `traffic-fines/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("imports")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      try {
        const { data: processingData, error: processingError } = await supabase.functions
          .invoke("process-traffic-fine-import", {
            body: { 
              fileName,
              repairedRows: analysis.repairedRows,
              validRows: analysis.validRows
            }
          });

        if (processingError) {
          console.error('Processing error:', processingError);
          throw new Error(processingError.message || 'Failed to process file');
        }

        if (!processingData?.success) {
          throw new Error(processingData?.error || 'Failed to process file');
        }

        toast({
          title: "Success",
          description: `Successfully imported ${processingData.processed} traffic fines${
            processingData.errors?.length ? ` with ${processingData.errors.length} errors` : ''
          }`,
        });

        if (processingData.errors?.length) {
          console.error('Import errors:', processingData.errors);
        }
      } catch (error: any) {
        console.error('Edge function error:', error);
        toast({
          title: "Import Processing Failed",
          description: "Failed to process the imported file. Please try again.",
          variant: "destructive",
        });
      }

    } catch (error: any) {
      console.error("Import error:", error);
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import traffic fines",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Import Traffic Fines</CardTitle>
          <CardDescription>
            Upload a CSV file containing traffic fine records. The file should include serial number,
            violation number, date (YYYY-MM-DD), license plate, location, charge, amount, and points.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ImportActions 
            onFileUpload={handleFileUpload}
            isUploading={isUploading}
            requiredHeaders={REQUIRED_HEADERS}
          />
        </CardContent>
      </Card>

      {analysisResult && (
        <>
          <ImportAnalysisCard analysis={analysisResult} />
          <ImportErrorReport analysis={analysisResult} />
        </>
      )}
    </div>
  );
};