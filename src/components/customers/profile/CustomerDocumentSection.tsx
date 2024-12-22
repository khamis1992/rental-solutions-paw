import { Button } from "@/components/ui/button";
import { CustomerDocumentUpload } from "../CustomerDocumentUpload";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CustomerDocumentSectionProps {
  profile: any;
}

export const CustomerDocumentSection = ({ profile }: CustomerDocumentSectionProps) => {
  const handleDocumentUpload = async (url: string, type: 'id' | 'license') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          [type === 'id' ? 'id_document_url' : 'license_document_url']: url
        })
        .eq('id', profile.id);

      if (error) throw error;

      toast.success(`${type === 'id' ? 'ID' : 'License'} document uploaded successfully`);
    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast.error(error.message || 'Failed to update document reference');
    }
  };

  return (
    <div className="col-span-2 space-y-4 border rounded-lg p-4 bg-muted/50">
      <h3 className="font-medium">Documents</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <CustomerDocumentUpload
            label="ID Document"
            fieldName="id_document_url"
            onUploadComplete={(url) => handleDocumentUpload(url, 'id')}
          />
          {profile.id_document_url && (
            <div className="mt-2">
              <a
                href={profile.id_document_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm">View ID Document</Button>
              </a>
            </div>
          )}
        </div>
        <div>
          <CustomerDocumentUpload
            label="Driver License"
            fieldName="license_document_url"
            onUploadComplete={(url) => handleDocumentUpload(url, 'license')}
          />
          {profile.license_document_url && (
            <div className="mt-2">
              <a
                href={profile.license_document_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm">View License Document</Button>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};