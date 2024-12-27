import { useState } from "react";
import { Form, FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";

interface ReceiptUploadProps {
  onUploadComplete: (url: string) => void;
}

export const ReceiptUpload = ({ onUploadComplete }: ReceiptUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const form = useForm();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload a PDF, JPEG, or PNG file.');
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast.error('File is too large. Maximum size is 5MB.');
      return;
    }

    setIsUploading(true);
    try {
      // Check if bucket exists before uploading
      const { data: buckets } = await supabase
        .storage
        .listBuckets();

      const receiptsBucketExists = buckets?.some(
        bucket => bucket.name === 'accounting_receipts'
      );

      if (!receiptsBucketExists) {
        console.error('Receipts bucket not found');
        toast.error('Storage configuration error. Please contact support.');
        return;
      }

      const fileExt = file.name.split(".").pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("accounting_receipts")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(uploadError.message);
      }

      const { data: { publicUrl } } = supabase.storage
        .from("accounting_receipts")
        .getPublicUrl(filePath);

      onUploadComplete(publicUrl);
      toast.success('Receipt uploaded successfully');
      event.target.value = ''; // Reset input
    } catch (error: any) {
      console.error('Error uploading receipt:', error);
      toast.error(error.message || 'Failed to upload receipt');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Form {...form}>
      <form>
        <FormItem>
          <FormLabel>Upload Receipt</FormLabel>
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
      </form>
    </Form>
  );
};