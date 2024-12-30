import { useImportProcess } from "./hooks/useImportProcess";
import { FileUploadSection } from "./payment-import/FileUploadSection";
import { AIAnalysisCard } from "./payment-import/AIAnalysisCard";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

export const PaymentImport = () => {
  const {
    isUploading,
    isAnalyzing,
    analysisResult,
    startImport,
    implementChanges
  } = useImportProcess();

  // Query to fetch imported transactions
  const { data: importedData, refetch } = useQuery({
    queryKey: ["imported-transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financial_imports")
        .select("*")
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    }
  });

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await startImport(file);
      refetch(); // Refresh the table data
    } catch (error: any) {
      console.error('Import error:', error);
      toast.error(error.message || 'Failed to import file');
    }
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
          onImplementChanges={implementChanges}
          isUploading={isUploading}
        />
      )}

      {isUploading && !analysisResult && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Importing payments...
        </div>
      )}

      {/* Display imported transactions */}
      {importedData && importedData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Imports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {importedData.map((item: any) => (
                <div 
                  key={item.id} 
                  className="border rounded-lg p-4 space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">
                        Transaction ID: {item.transaction_id || 'N/A'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Created: {new Date(item.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatCurrency(item.amount)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Status: {item.status || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm">
                    <p>Description: {item.description || 'N/A'}</p>
                    <p>Payment Method: {item.payment_method || 'N/A'}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};