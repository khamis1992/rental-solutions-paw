import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MaintenanceDocumentUploadProps {
  maintenanceId: string | null;
  onUploadComplete: () => void;
}

export function MaintenanceDocumentUpload({ maintenanceId, onUploadComplete }: MaintenanceDocumentUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || !event.target.files[0]) return;
      if (!maintenanceId) {
        toast.error("No maintenance ID provided");
        return;
      }

      setUploading(true);
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${maintenanceId}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('maintenance_documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('maintenance_documents')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from('maintenance_documents')
        .insert({
          maintenance_id: maintenanceId,
          document_type: file.type,
          document_url: publicUrl,
        });

      if (dbError) throw dbError;

      toast.success("Document uploaded successfully");
      onUploadComplete();
    } catch (error: any) {
      console.error("Error uploading document:", error);
      toast.error(error.message || "Error uploading document");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="document">Upload Document</Label>
      <Input
        id="document"
        type="file"
        onChange={handleFileUpload}
        disabled={uploading}
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
      />
      {uploading && (
        <div className="flex items-center gap-2">
          <Upload className="h-4 w-4 animate-pulse" />
          <span className="text-sm text-muted-foreground">Uploading...</span>
        </div>
      )}
    </div>
  );
}