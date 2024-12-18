import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Upload, Download, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface VehicleDocumentsProps {
  vehicleId: string;
}

export const VehicleDocuments = ({ vehicleId }: VehicleDocumentsProps) => {
  const [uploading, setUploading] = useState(false);

  const { data: documents, refetch } = useQuery({
    queryKey: ["vehicle-documents", vehicleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agreement_documents")
        .select("*")
        .eq("vehicle_id", vehicleId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const filePath = `${vehicleId}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('agreement_documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from('agreement_documents')
        .insert({
          vehicle_id: vehicleId,
          document_type: file.type,
          document_url: filePath,
        });

      if (dbError) throw dbError;

      toast.success('Document uploaded successfully');
      refetch();
      event.target.value = '';
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
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
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
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

      toast.success('Document deleted successfully');
      refetch();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="mr-2 h-5 w-5" />
          Vehicle Documents
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="document">Upload Document</Label>
          <Input
            id="document"
            type="file"
            onChange={handleFileUpload}
            disabled={uploading}
          />
        </div>

        <div className="space-y-4">
          {documents?.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-2 border rounded"
            >
              <span className="truncate max-w-[200px]">{doc.document_url.split('/').pop()}</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(doc.document_url, doc.document_url.split('/').pop()!)}
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
        </div>
      </CardContent>
    </Card>
  );
};