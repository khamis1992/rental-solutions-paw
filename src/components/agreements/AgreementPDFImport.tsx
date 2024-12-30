import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Upload } from "lucide-react";

export const AgreementPDFImport = () => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const file of files) {
        if (file.type !== 'application/pdf') {
          toast.error(`${file.name} is not a PDF file`);
          errorCount++;
          continue;
        }

        // Extract agreement number and vehicle number from filename
        const fileNameParts = file.name.split(' - ');
        if (fileNameParts.length !== 2) {
          toast.error(`Invalid file name format: ${file.name}`);
          errorCount++;
          continue;
        }

        const vehicleNumber = fileNameParts[0].trim();
        const agreementNumber = fileNameParts[1].replace('.pdf', '').trim();

        // Check if agreement exists
        const { data: agreement, error: agreementError } = await supabase
          .from('leases')
          .select('id')
          .eq('agreement_number', agreementNumber)
          .single();

        if (agreementError || !agreement) {
          toast.error(`No matching agreement found for: ${agreementNumber}`);
          errorCount++;
          continue;
        }

        // Upload file to storage
        const fileExt = 'pdf';
        const filePath = `${agreement.id}/${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('agreement_documents')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          toast.error(`Failed to upload: ${file.name}`);
          errorCount++;
          continue;
        }

        // Add document record
        const { error: docError } = await supabase
          .from('agreement_documents')
          .insert({
            lease_id: agreement.id,
            document_type: 'contract',
            document_url: filePath
          });

        if (docError) {
          console.error('Document record error:', docError);
          toast.error(`Failed to save document record for: ${file.name}`);
          errorCount++;
          continue;
        }

        successCount++;
      }

      toast.success(`Successfully processed ${successCount} files with ${errorCount} errors`);
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to process files');
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        className="relative"
        disabled={isUploading}
      >
        {isUploading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4 mr-2" />
            Import Agreement PDFs
          </>
        )}
        <input
          type="file"
          multiple
          accept=".pdf"
          onChange={handleFileUpload}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />
      </Button>
    </div>
  );
};