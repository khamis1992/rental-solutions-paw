import { FileUploadSection } from "./components/FileUploadSection";
import { ValidationSummary } from "./components/ValidationSummary";
import { ImportPreview } from "./components/ImportPreview";
import { useTransactionImport } from "./hooks/useTransactionImport";

export const TransactionImport = () => {
  const {
    isUploading,
    validRows,
    skippedRows,
    handleFileUpload,
    handleSaveTransactions
  } = useTransactionImport();

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

  const downloadErrorLog = () => {
    const logContent = skippedRows
      .map(row => `Row ${row.index}: ${row.reason}\nContent: ${row.content}`)
      .join('\n\n');
    
    const blob = new Blob([logContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'import_errors.log');
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

      {skippedRows.length > 0 && (
        <ValidationSummary 
          skippedRows={skippedRows}
          onDownloadLog={downloadErrorLog}
        />
      )}

      {validRows.length > 0 && (
        <ImportPreview
          data={validRows}
          onImport={handleSaveTransactions}
          isImporting={isUploading}
        />
      )}
    </div>
  );
};