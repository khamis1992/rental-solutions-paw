import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useCustomerImport = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleFileUpload = async (file: File): Promise<boolean> => {
    if (!file) return false;

    if (file.type !== "text/csv") {
      toast({
        title: "Error",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return false;
    }

    setIsUploading(true);
    try {
      console.log('Starting file upload process...');
      const fileExt = file.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      
      console.log('Uploading file to storage:', fileName);
      const { error: uploadError } = await supabase.storage
        .from("imports")
        .upload(fileName, file);

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw uploadError;
      }

      console.log('File uploaded successfully, creating import log...');
      const { error: logError } = await supabase
        .from("import_logs")
        .insert({
          file_name: fileName,
          import_type: "customers",
          status: "pending",
        });

      if (logError) {
        console.error('Import log creation error:', logError);
        throw logError;
      }

      console.log('Starting import process via Edge Function...');
      const { error: functionError } = await supabase.functions
        .invoke('process-customer-import', {
          body: { fileName }
        });

      if (functionError) {
        console.error('Edge Function error:', functionError);
        throw functionError;
      }

      // Poll for import completion
      const pollInterval = setInterval(async () => {
        console.log('Checking import status...');
        const { data: importLog } = await supabase
          .from("import_logs")
          .select("status, records_processed")
          .eq("file_name", fileName)
          .single();

        if (importLog?.status === "completed") {
          clearInterval(pollInterval);
          toast({
            title: "Success",
            description: `Successfully imported ${importLog.records_processed} customers`,
          });
          
          // Force refresh the queries
          await queryClient.invalidateQueries({ queryKey: ["customers"] });
          await queryClient.invalidateQueries({ queryKey: ["customer-stats"] });
          
          setIsUploading(false);
          return true;
        } else if (importLog?.status === "error") {
          clearInterval(pollInterval);
          throw new Error("Import failed");
        }
        
        toast({
          title: "Processing",
          description: "Import in progress...",
        });
      }, 1000);

      // Set a timeout to stop polling after 15 seconds
      setTimeout(() => {
        clearInterval(pollInterval);
        if (isUploading) {
          setIsUploading(false);
          toast({
            title: "Error",
            description: "Import timed out. Please try again.",
            variant: "destructive",
          });
        }
      }, 15000);

      return true;
    } catch (error: any) {
      console.error('Import process error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setIsUploading(false);
      return false;
    }
  };

  return {
    isUploading,
    handleFileUpload
  };
};