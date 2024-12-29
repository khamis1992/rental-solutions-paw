import { useImportProcess } from "./hooks/useImportProcess";
import { FileUploadSection } from "./payment-import/FileUploadSection";
import { AIAnalysisCard } from "./payment-import/AIAnalysisCard";
import { Loader2 } from "lucide-react";

export const PaymentImport = () => {
  const {
    isUploading,
    isAnalyzing,
    analysisResult,
    startImport,
    implementChanges
  } = useImportProcess();

  const downloadTemplate = () => {
    // Updated CSV template with all required headers
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
    if (file) {
      await startImport(file);
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
    </div>
  );
};