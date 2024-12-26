import { FileUploadSection } from "./components/FileUploadSection";
import { useTransactionImport } from "./hooks/useTransactionImport";

export const TransactionImport = () => {
  const { isUploading, handleFileUpload } = useTransactionImport();

  const downloadTemplate = () => {
    const csvContent = "Transaction_Date,Amount,Description,Category,Payment_Method,Reference_Number,Status,Notes,Tags\n" +
                      "2024-03-20,1000.00,Monthly Revenue,Income,bank_transfer,REF001,completed,Regular payment,revenue";
    
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
      />
    </div>
  );
};