import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
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
      const fileExt = file.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("imports")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { error: logError } = await supabase
        .from("import_logs")
        .insert({
          file_name: fileName,
          import_type: "customers",
          status: "pending",
        });

      if (logError) throw logError;

      // Poll for import completion
      const pollInterval = setInterval(async () => {
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