import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

export const AgreementImport = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "text/csv") {
      toast({
        title: "Error",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    let pollInterval: number;

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
          import_type: "agreements",
          status: "pending",
        });

      if (logError) {
        console.error('Import log creation error:', logError);
        throw logError;
      }

      console.log('Starting import process via Edge Function...');
      const { error: functionError } = await supabase.functions
        .invoke('process-agreement-import', {
          body: JSON.stringify({ fileName }), // Explicitly stringify the body
          headers: {
            'Content-Type': 'application/json',
          }
        });

      if (functionError) {
        console.error('Edge Function error:', functionError);
        throw functionError;
      }

      // Poll for import completion
      pollInterval = window.setInterval(async () => {
        console.log('Checking import status...');
        const { data: importLog } = await supabase
          .from("import_logs")
          .select("status, records_processed")
          .eq("file_name", fileName)
          .single();

        if (importLog?.status === "completed") {
          window.clearInterval(pollInterval);
          toast({
            title: "Success",
            description: `Successfully imported ${importLog.records_processed} agreements`,
          });
          
          // Force refresh the queries
          await queryClient.invalidateQueries({ queryKey: ["agreements"] });
          
          setIsUploading(false);
        } else if (importLog?.status === "error") {
          window.clearInterval(pollInterval);
          throw new Error("Import failed");
        }
      }, 1000);

      // Set a timeout to stop polling after 15 seconds
      setTimeout(() => {
        if (pollInterval) {
          window.clearInterval(pollInterval);
        }
        if (isUploading) {
          setIsUploading(false);
          toast({
            title: "Error",
            description: "Import timed out. Please try again.",
            variant: "destructive",
          });
        }
      }, 15000);

    } catch (error: any) {
      console.error('Import process error:', error);
      if (pollInterval) {
        window.clearInterval(pollInterval);
      }
      toast({
        title: "Error",
        description: error.message || "Failed to import agreements",
        variant: "destructive",
      });
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = "Agreement Number,License No,full_name,License Number,Check-out Date,Check-in Date,Return Date,STATUS\n" +
                      "AGR001,LIC123,John Doe,DL456,27/03/2024,28/03/2024,29/03/2024,active";
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'agreement_import_template.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          disabled={isUploading}
        />
        <Button
          variant="outline"
          onClick={downloadTemplate}
          disabled={isUploading}
        >
          Download Template
        </Button>
      </div>
      {isUploading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Importing agreements...
        </div>
      )}
    </div>
  );
};