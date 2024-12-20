import { useState } from "react";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
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
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("customer_documents")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("customer_documents")
        .getPublicUrl(filePath);

      onUploadComplete(publicUrl);

      toast({
        title: "Success",
        description: "Contract document uploaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
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
            accept=".pdf"
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