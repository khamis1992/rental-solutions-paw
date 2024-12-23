import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { FileUploadSection } from "./components/FileUploadSection";
import { TransactionPreviewTable } from "./TransactionPreviewTable";
import { Button } from "@/components/ui/button";
import { parseCSV } from "./utils/csvUtils";
import { supabase } from "@/integrations/supabase/client";

export const TransactionImport = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
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
      const text = await file.text();
      const parsedData = parseCSV(text);
      setPreviewData(parsedData);
      setShowPreview(true);
      setIsAnalyzing(false);
      
      toast({
        title: "Success",
        description: `Successfully parsed ${parsedData.length} transactions.`,
      });
    } catch (error: any) {
      console.error('CSV parsing error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to parse CSV file",
        variant: "destructive",
      });
      setIsAnalyzing(false);
    }
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
          transaction_date: row.date,
          amount: parseFloat(row.amount),
          description: row.description,
          category_id: row.category_id,
          type: parseFloat(row.amount) >= 0 ? 'income' : 'expense',
          customer_id: row.customer_id || null
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