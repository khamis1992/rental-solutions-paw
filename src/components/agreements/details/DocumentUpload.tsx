import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, FileText, Download } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DocumentViewer } from "@/components/shared/DocumentViewer";

interface DocumentUploadProps {
  agreementId: string;
}

export const DocumentUpload = ({ agreementId }: DocumentUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const { data: documents, isLoading } = useQuery({
    queryKey: ['agreement-documents', agreementId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agreement_documents')
        .select('*')
        .eq('lease_id', agreementId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type and size
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Invalid file type. Please upload a PDF or image file.');
        return;
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error('File is too large. Maximum size is 5MB.');
        return;
      }

      const fileExt = file.name.split('.').pop();
      const filePath = `${agreementId}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('agreement_documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('agreement_documents')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from('agreement_documents')
        .insert({
          lease_id: agreementId,
          document_type: file.type,
          document_url: filePath,
        });

      if (dbError) throw dbError;

      // Invalidate and refetch documents
      await queryClient.invalidateQueries({ queryKey: ['agreement-documents', agreementId] });

      toast.success('Document uploaded successfully');
      event.target.value = '';
    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast.error(error.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="document">Upload Document</Label>
        <div className="flex items-center gap-2">
          <Input
            id="document"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileUpload}
            disabled={uploading}
            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
          />
          {uploading && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Supported formats: PDF, JPEG, PNG (max 5MB)
        </p>
      </div>

      {/* Display uploaded documents */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading documents...</span>
          </div>
        ) : documents && documents.length > 0 ? (
          <div className="grid gap-4">
            {documents.map((doc) => (
              <DocumentViewer
                key={doc.id}
                documentUrl={doc.document_url}
                documentName={doc.document_url.split('/').pop()}
                bucket="agreement_documents"
              />
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            No documents uploaded yet
          </div>
        )}
      </div>
    </div>
  );
};