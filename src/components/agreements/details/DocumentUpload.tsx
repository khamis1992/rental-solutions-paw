import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DocumentUploadProps {
  agreementId: string;
}

export const DocumentUpload = ({ agreementId }: DocumentUploadProps) => {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const filePath = `${agreementId}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('agreement_documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from('agreement_documents')
        .insert({
          lease_id: agreementId,
          document_type: file.type,
          document_url: filePath,
        });

      if (dbError) throw dbError;

      toast.success('Document uploaded successfully');
      event.target.value = '';
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="document">Upload Document</Label>
        <Input
          id="document"
          type="file"
          onChange={handleFileUpload}
          disabled={uploading}
        />
      </div>
    </div>
  );
};