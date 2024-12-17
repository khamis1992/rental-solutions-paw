import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const ImportVehicles = () => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (file: File) => {
    try {
      setIsUploading(true);
      console.log('Starting file upload process...', file);
      
      // Validate file type
      if (!file.name.endsWith('.csv')) {
        throw new Error('Please upload a CSV file');
      }

      // Upload file to Supabase Storage
      const fileName = `vehicles/${Date.now()}-${file.name}`;
      console.log('Uploading file to storage:', fileName);
      
      const { error: uploadError } = await supabase.storage
        .from('imports')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw uploadError;
      }

      console.log('File uploaded successfully, calling edge function...');

      // Call Edge Function to process the file
      const { data: response, error: processError } = await supabase.functions
        .invoke('process-vehicle-import', {
          body: { fileName }
        });

      console.log('Edge function response:', response);

      if (processError || !response.success) {
        console.error('Edge function error:', processError || response.error);
        throw new Error(processError?.message || response.error || 'Failed to process file');
      }

      toast({
        title: "Import Started",
        description: response.message || "Your file is being processed. You'll be notified when it's complete.",
      });

      if (response.errors?.length > 0) {
        console.error('Import errors:', response.errors);
        toast({
          title: "Import Warnings",
          description: `There were ${response.errors.length} errors during import. Check console for details.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Import failed:', error);
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import vehicles",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name);
      await handleFileUpload(file);
    }
  };

  return (
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
  );
};