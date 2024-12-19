import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ContractNameDialog } from "./ContractNameDialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export function InstallmentImport() {
  const [isUploading, setIsUploading] = useState(false);
  const [showContractDialog, setShowContractDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleContractSubmit = async (contractName: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        await handleFileUpload(file, contractName);
      }
    };
    
    input.click();
    setShowContractDialog(false);
  };

  const handleFileUpload = async (file: File, contractName: string) => {
    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid File",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      console.log('Starting file upload...');
      const fileName = `installments/${Date.now()}_${file.name}`;
      
      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('imports')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      console.log('File uploaded, processing...');
      
      // Process the file with contract name - Now properly sending both required fields
      const { data: processingData, error: processingError } = await supabase
        .functions
        .invoke('process-installment-import', {
          body: { 
            fileName,
            contractName
          }
        });

      if (processingError) {
        console.error('Processing error:', processingError);
        throw processingError;
      }

      console.log('Processing complete:', processingData);

      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ["installment-analysis"] });

      toast({
        title: "Success",
        description: `Successfully imported ${processingData.processed} installments${
          processingData.errors?.length > 0 ? ` with ${processingData.errors.length} errors` : ''
        }`,
      });

      if (processingData.errors?.length > 0) {
        console.error('Import errors:', processingData.errors);
        toast({
          title: "Warning",
          description: "Some rows could not be imported. Check the console for details.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import installments",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Import Installments</h3>
          <Button 
            onClick={() => setShowContractDialog(true)}
            disabled={isUploading}
          >
            {isUploading ? "Uploading..." : "Import CSV"}
          </Button>
        </div>

        <ContractNameDialog
          open={showContractDialog}
          onOpenChange={setShowContractDialog}
          onSubmit={handleContractSubmit}
        />
      </div>
    </Card>
  );
}