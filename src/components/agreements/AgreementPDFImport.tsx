import { Dispatch, SetStateAction, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface AgreementPDFImportProps {
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
}

export const AgreementPDFImport = ({ open, onOpenChange }: AgreementPDFImportProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('pdf')) {
      toast.error('Please upload a PDF file');
      return;
    }

    setIsUploading(true);
    try {
      const fileName = `${crypto.randomUUID()}.pdf`;
      
      const { error: uploadError } = await supabase.storage
        .from('agreements')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { error: processingError } = await supabase.functions
        .invoke('process-agreement-import', {
          body: { fileName }
        });

      if (processingError) throw processingError;

      toast.success('Agreement imported successfully');
      queryClient.invalidateQueries({ queryKey: ['agreements'] });
      onOpenChange(false);
    } catch (error: any) {
      console.error('Import error:', error);
      toast.error(error.message || 'Failed to import agreement');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Agreement PDF</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Input
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            disabled={isUploading}
          />
          <Button
            variant="outline"
            disabled={isUploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload PDF
          </Button>
        </div>
        
        {isUploading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Importing agreement...
          </div>
        )}
      </CardContent>
    </Card>
  );
};