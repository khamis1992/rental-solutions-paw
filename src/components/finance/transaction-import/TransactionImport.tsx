import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileUploadSection } from "./components/FileUploadSection";
import { TransactionPreviewTable } from "./TransactionPreviewTable";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export const TransactionImport = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [importedData, setImportedData] = useState<any[]>([]);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "text/csv") {
      toast({
        title: "Invalid File Type",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const fileName = `transactions/${Date.now()}_${file.name}`;
      
      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from("imports")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Show success notification
      toast({
        title: "Import Started",
        description: "Your import has been initiated. You'll be redirected to the dashboard.",
      });

      // Start processing in the background
      const processingPromise = supabase.functions
        .invoke("process-transaction-import", {
          body: { fileName }
        })
        .then(async ({ data, error }) => {
          if (error) throw error;
          
          await queryClient.invalidateQueries({ queryKey: ["transactions"] });
          
          toast({
            title: "Import Complete",
            description: "Your transactions have been processed successfully.",
          });
        })
        .catch((error) => {
          console.error("Import error:", error);
          toast({
            title: "Import Error",
            description: error.message || "Failed to process import",
            variant: "destructive",
          });
        })
        .finally(() => {
          setIsUploading(false);
        });

      // Redirect to dashboard immediately after starting the import
      navigate("/finance?tab=dashboard");

    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload file",
        variant: "destructive",
      });
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <FileUploadSection 
        onFileUpload={handleFileUpload}
        isUploading={isUploading}
      />
      
      {isUploading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Processing file...
        </div>
      )}
      
      <TransactionPreviewTable 
        data={importedData}
        onDataChange={setImportedData}
      />
    </div>
  );
};