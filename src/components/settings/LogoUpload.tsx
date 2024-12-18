import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const LogoUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings } = useQuery({
    queryKey: ["company-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("company_settings")
        .select("*")
        .single();

      if (error) throw error;
      return data;
    },
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file (JPEG, PNG)",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 2MB",
          variant: "destructive",
        });
        return;
      }

      setIsUploading(true);

      // Upload to storage
      const fileExt = file.name.split('.').pop();
      const filePath = `company-logo.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('company_assets')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('company_assets')
        .getPublicUrl(filePath);

      // Update company settings
      const { error: updateError } = await supabase
        .from('company_settings')
        .update({ logo_url: publicUrl })
        .eq('id', settings?.id);

      if (updateError) throw updateError;

      queryClient.invalidateQueries({ queryKey: ["company-settings"] });

      toast({
        title: "Logo uploaded",
        description: "Company logo has been updated successfully",
      });
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading the logo",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveLogo = async () => {
    try {
      if (!settings?.logo_url) return;

      const fileName = settings.logo_url.split('/').pop();
      
      // Remove from storage
      const { error: storageError } = await supabase.storage
        .from('company_assets')
        .remove([fileName]);

      if (storageError) throw storageError;

      // Update company settings
      const { error: updateError } = await supabase
        .from('company_settings')
        .update({ logo_url: null })
        .eq('id', settings.id);

      if (updateError) throw updateError;

      queryClient.invalidateQueries({ queryKey: ["company-settings"] });

      toast({
        title: "Logo removed",
        description: "Company logo has been removed successfully",
      });
    } catch (error) {
      console.error('Error removing logo:', error);
      toast({
        title: "Remove failed",
        description: "There was an error removing the logo",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <Label className="text-lg font-semibold">Company Logo</Label>
            <p className="text-sm text-muted-foreground">
              Upload your company logo to be used in documents and reports
            </p>
          </div>
          {settings?.logo_url && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRemoveLogo}
              className="ml-4"
            >
              <X className="h-4 w-4 mr-2" />
              Remove Logo
            </Button>
          )}
        </div>

        {settings?.logo_url && (
          <div className="mt-4">
            <img
              src={settings.logo_url}
              alt="Company Logo"
              className="max-h-32 object-contain"
            />
          </div>
        )}

        <div className="mt-4">
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={isUploading}
          />
          <p className="text-sm text-muted-foreground mt-2">
            Supported formats: JPEG, PNG. Maximum size: 2MB
          </p>
        </div>

        {isUploading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Uploading...
          </div>
        )}
      </div>
    </Card>
  );
};