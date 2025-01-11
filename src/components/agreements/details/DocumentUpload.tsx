import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Upload, Download, Trash2, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface DocumentUploadProps {
  agreementId: string;
}

export const DocumentUpload = ({ agreementId }: DocumentUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  // Query to fetch existing documents
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

      // Validate file type
      if (file.type !== 'application/pdf') {
        toast.error('Please upload a PDF file');
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error('File is too large. Maximum size is 5MB');
        return;
      }

      // Get agreement details for matching
      const { data: agreement } = await supabase
        .from('leases')
        .select('agreement_number')
        .eq('id', agreementId)
        .single();

      const fileExt = file.name.split('.').pop();
      const filePath = `${agreementId}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('agreement_documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('agreement_documents')
        .getPublicUrl(filePath);

      // Save document metadata
      const { error: dbError } = await supabase
        .from('agreement_documents')
        .insert({
          lease_id: agreementId,
          document_type: 'agreement',
          document_url: filePath,
          original_filename: file.name,
          file_size: file.size,
          upload_status: 'completed',
          assignment_method: file.name.includes(agreement?.agreement_number || '') ? 'automatic' : 'manual',
          matched_agreement_number: agreement?.agreement_number || null
        });

      if (dbError) throw dbError;

      queryClient.invalidateQueries({ queryKey: ['agreement-documents', agreementId] });
      toast.success('Document uploaded successfully');
      event.target.value = '';
    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast.error(error.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (documentUrl: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('agreement_documents')
        .download(documentUrl);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download document');
    }
  };

  const handleDelete = async (documentId: string, documentUrl: string) => {
    try {
      const { error: storageError } = await supabase.storage
        .from('agreement_documents')
        .remove([documentUrl]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('agreement_documents')
        .delete()
        .eq('id', documentId);

      if (dbError) throw dbError;

      queryClient.invalidateQueries({ queryKey: ['agreement-documents', agreementId] });
      toast.success('Document deleted successfully');
    } catch (error: any) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Agreement Documents
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="document">Upload Agreement Document</Label>
            <Input
              id="document"
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              disabled={uploading}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
            {uploading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="text-center py-4">
              <Loader2 className="h-6 w-6 animate-spin mx-auto" />
              <p className="text-sm text-muted-foreground mt-2">Loading documents...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {documents?.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex flex-col">
                    <span className="truncate max-w-[200px] font-medium">
                      {doc.original_filename || doc.document_url.split('/').pop()}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {doc.assignment_method === 'automatic' ? 'Automatically matched' : 'Manually assigned'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(doc.document_url, doc.original_filename || 'document.pdf')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(doc.id, doc.document_url)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {documents?.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No documents uploaded yet
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};