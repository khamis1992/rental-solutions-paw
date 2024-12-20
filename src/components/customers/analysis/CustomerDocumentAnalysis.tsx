import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CustomerDocumentAnalysisProps {
  customerId: string;
}

export const CustomerDocumentAnalysis = ({ customerId }: CustomerDocumentAnalysisProps) => {
  const { data: documents, isLoading } = useQuery({
    queryKey: ['customer-documents', customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id_document_url, license_document_url')
        .eq('id', customerId)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div>Loading document analysis...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Document Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {(!documents?.id_document_url && !documents?.license_document_url) ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No documents available for analysis. Please upload customer documents first.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {documents.id_document_url && (
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">ID Document Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Document verification status: Pending AI analysis
                </p>
              </div>
            )}
            {documents.license_document_url && (
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">License Document Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Document verification status: Pending AI analysis
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};