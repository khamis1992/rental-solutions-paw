import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ContractNameDialog } from "./ContractNameDialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function InstallmentImport() {
  const [isUploading, setIsUploading] = useState(false);
  const [showContractDialog, setShowContractDialog] = useState(false);
  const { toast } = useToast();

  const handleContractSubmit = async (contractName: string) => {
    // Open file input after contract name is submitted
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
      const fileName = `installments/${Date.now()}_${file.name}`;
      
      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('imports')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Process the file with contract name
      const { data: processingData, error: processingError } = await supabase
        .functions
        .invoke('process-installment-import', {
          body: { 
            filePath: fileName,
            contractName: contractName
          }
        });

      if (processingError) throw processingError;

      toast({
        title: "Success",
        description: "Installments imported successfully",
      });
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