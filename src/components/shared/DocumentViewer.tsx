import { useState } from "react";
import { FileText, Download, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface DocumentViewerProps {
  documentUrl: string;
  documentName?: string;
  bucket: string;
  className?: string;
}

export const DocumentViewer = ({
  documentUrl,
  documentName,
  bucket,
  className = "",
}: DocumentViewerProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isViewing, setIsViewing] = useState(false);

  const handleDownload = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.storage
        .from(bucket)
        .download(documentUrl);

      if (error) throw error;

      // Create a download link
      const url = URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = url;
      link.download = documentName || documentUrl.split("/").pop() || "document";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Document downloaded successfully");
    } catch (error: any) {
      console.error("Error downloading document:", error);
      toast.error(error.message || "Failed to download document");
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = async () => {
    try {
      setIsLoading(true);
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(documentUrl);

      // Open document in new tab
      window.open(publicUrl, "_blank");
      setIsViewing(true);
    } catch (error: any) {
      console.error("Error viewing document:", error);
      toast.error(error.message || "Failed to view document");
    } finally {
      setIsLoading(false);
    }
  };

  const displayName = documentName || documentUrl.split("/").pop() || "Document";

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          <FileText className="h-4 w-4" />
          {displayName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleView}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Eye className="h-4 w-4 mr-2" />
            )}
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};