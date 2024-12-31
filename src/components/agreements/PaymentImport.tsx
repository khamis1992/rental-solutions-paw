import { Dispatch, SetStateAction, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AIAnalysisCard } from "@/components/finance/transactions/AIAnalysisCard";
import { FileUploadSection } from "@/components/finance/transactions/FileUploadSection";
import { useImportProcess } from "@/components/finance/transactions/hooks/useImportProcess";

interface PaymentImportProps {
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
}

export const PaymentImport = ({ open, onOpenChange }: PaymentImportProps) => {
  const {
    isUploading,
    isAnalyzing,
    analysisResult,
    startImport,
    implementChanges
  } = useImportProcess();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const success = await startImport(file);
    if (!success) {
      event.target.value = '';
    }
  };

  const downloadTemplate = () => {
    const headers = [
      "Lease_ID",
      "Customer_Name",
      "Amount",
      "License_Plate",
      "Vehicle",
      "Payment_Date",
      "Payment_Method",
      "Transaction_ID",
      "Description",
      "Type",
      "Status"
    ].join(",");
    
    const csvContent = `data:text/csv;charset=utf-8,${headers}\n`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "payment_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Import Payments</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
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
        </div>
      </DialogContent>
    </Dialog>
  );
};