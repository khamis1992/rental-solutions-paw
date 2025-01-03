import { FileUpload } from "./components/FileUpload";
import { ImportTable } from "./components/ImportTable";
import { usePaymentImport } from "./hooks/usePaymentImport";

export const PaymentImport = () => {
  const {
    isUploading,
    importedData,
    headers,
    handleFileUpload,
    downloadTemplate
  } = usePaymentImport();

  return (
    <div className="space-y-4">
      <FileUpload
        onFileUpload={handleFileUpload}
        onDownloadTemplate={downloadTemplate}
        isUploading={isUploading}
      />
      
      {importedData.length > 0 && (
        <ImportTable headers={headers} data={importedData} />
      )}
    </div>
  );
};