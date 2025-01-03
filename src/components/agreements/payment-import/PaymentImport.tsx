import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { FileUploadSection } from "./components/FileUploadSection";
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
      <FileUploadSection
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