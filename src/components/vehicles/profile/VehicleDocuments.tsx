import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Upload, Download, Trash2, Folder } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface VehicleDocumentsProps {
  vehicleId: string;
}

type DocumentsByCategory = {
  [key in 'registration' | 'insurance' | 'maintenance' | 'other']: {
    id: string;
    document_type: string;
    document_url: string;
    uploaded_by: string | null;
    expiry_date: string | null;
    category: string;
    created_at: string;
  }[];
};

export const VehicleDocuments = ({ vehicleId }: VehicleDocumentsProps) => {
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("registration");
  const queryClient = useQueryClient();

  const { data: documents, isLoading } = useQuery({
    queryKey: ["vehicle-documents", vehicleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicle_documents")
        .select("*")
        .eq("vehicle_id", vehicleId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const documentsByCategory = documents?.reduce((acc: DocumentsByCategory, doc) => {
    const category = doc.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(doc);
    return acc;
  }, {
    registration: [],
    insurance: [],
    maintenance: [],
    other: []
  } as DocumentsByCategory);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const timestamp = new Date().getTime();
      const fileName = `${timestamp}_${file.name}`;
      const filePath = `${vehicleId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('vehicle_documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('vehicle_documents')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from('vehicle_documents')
        .insert({
          vehicle_id: vehicleId,
          document_type: file.type,
          document_url: filePath,
          category: selectedCategory,
        });

      if (dbError) throw dbError;

      queryClient.invalidateQueries({ queryKey: ["vehicle-documents", vehicleId] });
      toast.success('Document uploaded successfully');
      event.target.value = '';
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (documentUrl: string, originalName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('vehicle_documents')
        .download(documentUrl);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = originalName || documentUrl.split('/').pop() || 'document';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download document');
    }
  };

  const handleDelete = async (documentId: string, documentUrl: string) => {
    try {
      const { error: storageError } = await supabase.storage
        .from('vehicle_documents')
        .remove([documentUrl]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('vehicle_documents')
        .delete()
        .eq('id', documentId);

      if (dbError) throw dbError;

      queryClient.invalidateQueries({ queryKey: ["vehicle-documents", vehicleId] });
      toast.success('Document deleted successfully');
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Folder className="h-5 w-5" />
          Digital Vehicle Folder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="registration" value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="w-full">
            <TabsTrigger value="registration">Registration</TabsTrigger>
            <TabsTrigger value="insurance">Insurance</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="other">Other</TabsTrigger>
          </TabsList>

          <div className="mt-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="document">Upload Document</Label>
              <Input
                id="document"
                type="file"
                onChange={handleFileUpload}
                disabled={uploading}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
            </div>
          </div>

          {Object.entries(documentsByCategory || {}).map(([category, docs]) => (
            <TabsContent key={category} value={category}>
              {docs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No documents in this category</p>
              ) : (
                <div className="space-y-4">
                  {docs.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium truncate max-w-[200px]">
                            {doc.document_url.split('/').pop()}
                          </p>
                          {doc.expiry_date && (
                            <p className="text-xs text-muted-foreground">
                              Expires: {new Date(doc.expiry_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(doc.document_url, doc.document_url.split('/').pop() || '')}
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
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};