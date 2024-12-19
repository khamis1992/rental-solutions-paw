import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function InstallmentImport() {
  const [isUploading, setIsUploading] = useState(false);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'text/csv': ['.csv']
    },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;

      setIsUploading(true);
      const file = acceptedFiles[0];

      try {
        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('imports')
          .upload(`installments/${Date.now()}_${file.name}`, file);

        if (uploadError) throw uploadError;

        const { data: processingData, error: processingError } = await supabase
          .functions
          .invoke('process-installment-import', {
            body: { filePath: uploadData.path }
          });

        if (processingError) throw processingError;

        toast.success("Installments imported successfully");
      } catch (error) {
        console.error('Import error:', error);
        toast.error("Failed to import installments");
      } finally {
        setIsUploading(false);
      }
    }
  });

  const downloadTemplate = () => {
    const csvContent = "N°cheque,Amount,Date,Drawee Bank,sold\n" +
                      "12345,QAR 100000.000,July-24,QNB,QAR 100000.000";
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'installment_template.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Import Installments</h3>
          <Button 
            variant="outline" 
            onClick={downloadTemplate}
          >
            Download Template
          </Button>
        </div>

        <div
          {...getRootProps()}
          className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
        >
          <input {...getInputProps()} />
          {isUploading ? (
            <p>Uploading...</p>
          ) : (
            <p>Drag and drop a CSV file here, or click to select one</p>
          )}
        </div>
      </div>
    </Card>
  );
}