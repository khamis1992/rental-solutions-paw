import { FileText, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DocumentViewer } from "@/components/shared/DocumentViewer";

interface CustomerDocumentsProps {
  customerId: string;
}

export const CustomerDocuments = ({ customerId }: CustomerDocumentsProps) => {
  const { data: customer, isLoading } = useQuery({
    queryKey: ['customer-documents', customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id_document_url, license_document_url')
        .eq('id', customerId)
        .single();
      
      if (error) throw error;

      // Get public URLs for both documents if they exist
      const idDocumentUrl = data.id_document_url 
        ? supabase.storage.from('customer_documents').getPublicUrl(data.id_document_url).data.publicUrl
        : null;
      
      const licenseDocumentUrl = data.license_document_url
        ? supabase.storage.from('customer_documents').getPublicUrl(data.license_document_url).data.publicUrl
        : null;

      return {
        ...data,
        id_document_url: idDocumentUrl,
        license_document_url: licenseDocumentUrl
      };
    },
    enabled: !!customerId,
  });

  if (!customerId || isLoading) return null;

  return (
    <div className="col-span-2 space-y-4 border rounded-lg p-4 bg-muted/50">
      <h3 className="font-medium">Customer Documents</h3>
      <div className="grid grid-cols-2 gap-4">
        {customer?.id_document_url ? (
          <DocumentViewer
            documentUrl={customer.id_document_url}
            documentName="ID Document"
            bucket="customer_documents"
          />
        ) : (
          <div className="flex items-center gap-2 p-2 rounded-md text-gray-400">
            <FileText className="h-4 w-4" />
            <span>ID Document</span>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </div>
        )}
        {customer?.license_document_url ? (
          <DocumentViewer
            documentUrl={customer.license_document_url}
            documentName="Driver License"
            bucket="customer_documents"
          />
        ) : (
          <div className="flex items-center gap-2 p-2 rounded-md text-gray-400">
            <FileText className="h-4 w-4" />
            <span>Driver License</span>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </div>
        )}
      </div>
    </div>
  );
};