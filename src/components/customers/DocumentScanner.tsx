import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Upload, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DocumentScannerProps {
  onScanComplete: (extractedData: any) => void;
  customerId: string;
}

export const DocumentScanner = ({ onScanComplete, customerId }: DocumentScannerProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      setIsUploading(true);

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const filePath = `${customerId}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('customer_documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('customer_documents')
        .getPublicUrl(filePath);

      setIsUploading(false);
      setIsAnalyzing(true);

      // Call the analyze-document function
      const { data: analysisData, error: analysisError } = await supabase.functions
        .invoke('analyze-customer-document', {
          body: {
            documentUrl: publicUrl,
            documentType: 'id_document',
            profileId: customerId
          }
        });

      if (analysisError) throw analysisError;

      // Log analysis results
      console.log("Document analysis results:", analysisData);

      // Store analysis results in document_analysis_logs
      const { error: logError } = await supabase
        .from('document_analysis_logs')
        .insert({
          profile_id: customerId,
          document_type: 'id_document',
          document_url: publicUrl,
          extracted_data: analysisData.data,
          confidence_score: analysisData.confidence || 0.8,
          status: 'completed'
        });

      if (logError) {
        console.error("Error logging analysis:", logError);
        throw logError;
      }

      toast.success("Document analyzed successfully");
      onScanComplete(analysisData.data);
    } catch (error: any) {
      console.error('Error in document scanning:', error);
      toast.error(error.message || "Failed to process document");
    } finally {
      setIsUploading(false);
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-medium">ID Document Scanner</h3>
      </div>
      
      <div className="space-y-2">
        <Input
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileUpload}
          disabled={isUploading || isAnalyzing}
          className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
        />
        <p className="text-sm text-muted-foreground">
          Upload an ID document to automatically extract information
        </p>
      </div>

      {(isUploading || isAnalyzing) && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{isUploading ? "Uploading..." : "Analyzing document..."}</span>
        </div>
      )}
    </div>
  );
};