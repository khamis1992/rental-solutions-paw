import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FileUploadSection } from "./FileUploadSection";
import { AIAnalysisCard } from "./AIAnalysisCard";
import { useImportProcess } from "./hooks/useImportProcess";

interface TransactionImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TransactionImportDialog = ({ open, onOpenChange }: TransactionImportDialogProps) => {
  const { isUploading, isAnalyzing, analysisResult, startImport, implementChanges } = useImportProcess();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      toast.error("Please select a file to import.");
      return;
    }

    const success = await startImport(file);
    if (!success) {
      event.target.value = '';
    }
  };

  const handleDownloadTemplate = () => {
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
    link.setAttribute("download", "transaction_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Import Transactions</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <FileUploadSection
            onFileUpload={handleFileUpload}
            onDownloadTemplate={handleDownloadTemplate}
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