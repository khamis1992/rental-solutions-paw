import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useCustomerImport } from "./hooks/useCustomerImport";
import { Upload, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export const ImportExportCustomers = () => {
  const { toast } = useToast();
  const { isUploading, handleFileUpload } = useCustomerImport();
  const queryClient = useQueryClient();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await handleFileUpload(file);
    }
  };

  const handleCleanupDuplicates = async () => {
    try {
      const { error } = await supabase.functions.invoke('cleanup-duplicate-customers');
      
      if (error) throw error;

      toast({
        title: "Success",
        description: "Successfully cleaned up duplicate customers",
      });

      // Refresh the customers list
      await queryClient.invalidateQueries({ queryKey: ["customers"] });

    } catch (error: any) {
      console.error('Cleanup error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex gap-2">
      <Button disabled={isUploading} asChild>
        <label className="cursor-pointer">
          <Upload className="mr-2 h-4 w-4" />
          {isUploading ? "Importing..." : "Import CSV"}
          <input
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>
      </Button>
      <Button 
        variant="outline" 
        onClick={handleCleanupDuplicates}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Clean Duplicates
      </Button>
    </div>
  );
};