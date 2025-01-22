import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Upload, Download, Trash2, Folder, Eye } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDropzone } from 'react-dropzone';
import { IframeSandbox } from "@/components/common/IframeSandbox";
import { DateInput } from "@/components/ui/date-input";

interface VehicleDocumentsProps {
  vehicleId: string;
}

type DocumentCategory = 'registration' | 'insurance' | 'maintenance' | 'other';

type VehicleDocument = {
  id: string;
  document_type: string;
  document_url: string;
  uploaded_by: string | null;
  expiry_date: string | null;
  category: DocumentCategory;
  created_at: string;
};

type DocumentsByCategory = {
  [key in DocumentCategory]: VehicleDocument[];
};

export const VehicleDocuments = ({ vehicleId }: VehicleDocumentsProps) => {
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory>("registration");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [expiryDate, setExpiryDate] = useState<Date | null>(null);
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

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      setUploading(true);
      const file = acceptedFiles[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('application/pdf') && !file.type.startsWith('image/')) {
        toast.error('Please upload a PDF or image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }

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
          expiry_date: expiryDate ? expiryDate.toISOString() : null
        });

      if (dbError) throw dbError;

      queryClient.invalidateQueries({ queryKey: ["vehicle-documents", vehicleId] });
      toast.success('Document uploaded successfully');
      setExpiryDate(null); // Reset expiry date after successful upload
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
    } finally {
      setUploading(false);
    }
  }, [vehicleId, selectedCategory, queryClient, expiryDate]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    multiple: false
  });

  const handlePreview = async (documentUrl: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('vehicle_documents')
        .createSignedUrl(documentUrl, 3600);

      if (error) throw error;
      setPreviewUrl(data.signedUrl);
    } catch (error) {
      console.error('Error generating preview URL:', error);
      toast.error('Failed to preview document');
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
      setPreviewUrl(null);
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Folder className="h-5 w-5" />
          Digital Vehicle Folder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="registration" value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as DocumentCategory)}>
          <TabsList className="w-full">
            <TabsTrigger value="registration">Registration</TabsTrigger>
            <TabsTrigger value="insurance">Insurance</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="other">Other</TabsTrigger>
          </TabsList>

          <div className="mt-4">
            <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50'}`}>
              <input {...getInputProps()} />
              <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              {isDragActive ? (
                <p className="text-sm text-muted-foreground">Drop the file here</p>
              ) : (
                <>
                  <p className="text-sm font-medium">Drag & drop a file here, or click to select</p>
                  <p className="text-xs text-muted-foreground mt-1">Supports PDF and images up to 5MB</p>
                </>
              )}
            </div>
            <div className="mt-4">
              <DateInput
                label="Document Expiry Date (Optional)"
                value={expiryDate ? expiryDate.toLocaleDateString() : ''}
                onDateChange={setExpiryDate}
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
                          onClick={() => handlePreview(doc.document_url)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
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

        {previewUrl && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium">Document Preview</h3>
              <Button variant="outline" size="sm" onClick={() => setPreviewUrl(null)}>
                Close Preview
              </Button>
            </div>
            <IframeSandbox
              src={previewUrl}
              title="Document Preview"
              height="600px"
              className="w-full border rounded-lg"
              allowScripts={true}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};