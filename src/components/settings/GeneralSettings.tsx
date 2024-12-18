import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { LogoUpload } from "./LogoUpload";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const GeneralSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    companyName: "",
    businessEmail: "",
    phone: "",
    address: "",
    darkMode: false,
    automaticUpdates: true
  });

  // Load existing settings
  const { data: settings } = useQuery({
    queryKey: ['company-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data) {
        setFormData({
          companyName: data.company_name || "",
          businessEmail: data.business_email || "",
          phone: data.phone || "",
          address: data.address || "",
          darkMode: data.dark_mode || false,
          automaticUpdates: data.automatic_updates || true
        });
      }
    }
  });

  const handleSave = async () => {
    try {
      setIsSaving(true);

      const { error } = await supabase
        .from('company_settings')
        .upsert({
          id: settings?.id || undefined,
          company_name: formData.companyName,
          business_email: formData.businessEmail,
          phone: formData.phone,
          address: formData.address,
          dark_mode: formData.darkMode,
          automatic_updates: formData.automaticUpdates
        });

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['company-settings'] });
      
      toast({
        title: "Settings saved",
        description: "Your company settings have been updated successfully.",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <LogoUpload />

      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>
            Update your company details and business information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input 
                id="companyName" 
                value={formData.companyName}
                onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                placeholder="AutoRent Pro" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessEmail">Business Email</Label>
              <Input 
                id="businessEmail" 
                type="email" 
                value={formData.businessEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, businessEmail: e.target.value }))}
                placeholder="contact@autorentpro.com" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone" 
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+1 (555) 000-0000" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Business Address</Label>
              <Input 
                id="address" 
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="123 Business St" 
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System Preferences</CardTitle>
          <CardDescription>
            Customize your dashboard experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Dark Mode</Label>
              <p className="text-sm text-muted-foreground">
                Enable dark mode for the dashboard
              </p>
            </div>
            <Switch 
              checked={formData.darkMode}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, darkMode: checked }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Automatic Updates</Label>
              <p className="text-sm text-muted-foreground">
                Receive automatic updates for the system
              </p>
            </div>
            <Switch 
              checked={formData.automaticUpdates}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, automaticUpdates: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};