import { useState } from "react";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface ContractDocumentUploadProps {
  label: string;
  fieldName: string;
  onUploadComplete: (url: string) => void;
}

export const ContractDocumentUpload = ({
  label,
  fieldName,
  onUploadComplete,
}: ContractDocumentUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload a PDF, JPEG, or PNG file.');
      return;
    }

    // Validate file size (2MB limit)
    const maxSize = 2 * 1024 * 1024; // 2MB in bytes
    if (file.size > maxSize) {
      toast.error('File is too large. Maximum size is 2MB.');
      return;
    }

    setIsUploading(true);
    try {
      // Check if bucket exists before uploading
      const { data: buckets } = await supabase
        .storage
        .listBuckets();

      const customerDocumentsBucketExists = buckets?.some(
        bucket => bucket.name === 'customer_documents'
      );

      if (!customerDocumentsBucketExists) {
        console.error('Customer documents bucket not found');
        toast.error('Storage configuration error. Please contact support.');
        return;
      }

      const fileExt = file.name.split(".").pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("customer_documents")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(uploadError.message);
      }

      const { data: { publicUrl } } = supabase.storage
        .from("customer_documents")
        .getPublicUrl(filePath);

      onUploadComplete(publicUrl);

      toast.success('Document uploaded successfully');
      event.target.value = ''; // Reset input
    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast.error(error.message || 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <div className="flex items-center gap-2">
          <Input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
          />
          {isUploading && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
};