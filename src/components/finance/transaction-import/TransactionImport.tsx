import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { FileUploadSection } from "./components/FileUploadSection";
import { TransactionPreviewTable } from "./TransactionPreviewTable";
import { Button } from "@/components/ui/button";
import { parseCSV } from "./utils/csvUtils";
import { supabase } from "@/integrations/supabase/client";
import { HeaderMappingDialog } from "./components/HeaderMappingDialog";
import { useHeaderMapping } from "./hooks/useHeaderMapping";
import { getRequiredHeaders } from "./utils/headerMapping";

export const TransactionImport = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [showHeaderMapping, setShowHeaderMapping] = useState(false);
  const [currentHeaders, setCurrentHeaders] = useState<string[]>([]);
  const [csvContent, setCsvContent] = useState<string>('');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { validateAndMapHeaders, applyMapping } = useHeaderMapping();

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
      const text = await file.text();
      setCsvContent(text);
      
      const lines = text.split('\n').map(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      
      const { isValid, unmappedHeaders } = validateAndMapHeaders(headers, getRequiredHeaders());
      
      if (!isValid && unmappedHeaders.length > 0) {
        setCurrentHeaders(headers);
        setShowHeaderMapping(true);
        return;
      }
      
      processCSVContent(text, headers);
    } catch (error: any) {
      console.error('CSV parsing error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to parse CSV file",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const processCSVContent = (content: string, headers: string[]) => {
    try {
      const parsedData = parseCSV(content);
      console.log('Parsed CSV data:', parsedData);
      
      setPreviewData(parsedData);
      setShowPreview(true);
      
      toast({
        title: "Success",
        description: `Successfully parsed ${parsedData.length} transactions.`,
      });
    } catch (error: any) {
      console.error('CSV processing error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process CSV data",
        variant: "destructive",
      });
    }
  };

  const handleHeaderMapping = (mapping: Record<string, string>) => {
    const mappedHeaders = applyMapping(currentHeaders, mapping);
    const headerLine = mappedHeaders.join(',');
    const contentLines = csvContent.split('\n').slice(1);
    const newContent = [headerLine, ...contentLines].join('\n');
    
    processCSVContent(newContent, mappedHeaders);
  };

  const handleDataChange = (newData: any[]) => {
    setPreviewData(newData);
  };

  const handleSaveTransactions = async () => {
    setIsUploading(true);
    try {
      const { data, error } = await supabase
        .from('accounting_transactions')
        .insert(previewData.map(row => ({
          transaction_date: row.payment_date,
          amount: row.amount,
          description: row.payment_description,
          type: parseFloat(row.amount) >= 0 ? 'income' : 'expense',
          status: row.status || 'pending',
          reference_type: 'agreement',
          reference_id: row.agreement_number
        })));

      if (error) throw error;

      toast({
        title: "Success",
        description: `Successfully imported ${previewData.length} transactions.`,
      });
      
      await queryClient.invalidateQueries({ queryKey: ["transactions"] });
      setShowPreview(false);
      setPreviewData([]);
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
    const csvContent = "Agreement_Number,Customer_Name,Amount,License_Plate,Vehicle,Payment_Date,Payment_Method,Payment_Number,Payment_Description\n" +
                      "AGR-001,John Doe,1000.00,ABC123,Toyota Camry,2024-03-20,credit_card,INV001,Monthly payment";
    
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

      <HeaderMappingDialog
        isOpen={showHeaderMapping}
        onClose={() => setShowHeaderMapping(false)}
        headers={currentHeaders}
        onSaveMapping={handleHeaderMapping}
      />

      {isAnalyzing && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Processing import...
        </div>
      )}

      {showPreview && previewData.length > 0 && (
        <div className="space-y-4">
          <TransactionPreviewTable
            data={previewData}
            onDataChange={handleDataChange}
          />
          
          <div className="flex justify-end">
            <Button 
              onClick={handleSaveTransactions}
              disabled={isUploading}
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
          </div>
        </div>
      )}
    </div>
  );
};