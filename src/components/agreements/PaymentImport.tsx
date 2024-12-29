import { useImportProcess } from "./hooks/useImportProcess";
import { FileUploadSection } from "./payment-import/FileUploadSection";
import { AIAnalysisCard } from "./payment-import/AIAnalysisCard";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export const PaymentImport = () => {
  const { toast } = useToast();
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
        .from("remaining_amounts")
        .select("*")
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    }
  });

  const downloadTemplate = () => {
    const csvContent = "Agreement_Number,License_Plate,Rent_Amount,Final_Price,Amount_Paid,Remaining_Amount,Agreement_Duration\n" +
                      "AGR-001,ABC123,1000,12000,3000,9000,12";
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'remaining_amounts_template.csv');
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
      toast({
        title: "Error",
        description: error.message || 'Failed to import file',
        variant: "destructive",
      });
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
          Importing remaining amounts...
        </div>
      )}

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
                        Agreement: {item.agreement_number || 'N/A'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        License Plate: {item.license_plate || 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatCurrency(item.remaining_amount)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Total Paid: {formatCurrency(item.amount_paid)}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm">
                    <p>Final Price: {formatCurrency(item.final_price)}</p>
                    <p>Rent Amount: {formatCurrency(item.rent_amount)}</p>
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