import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Pencil, Save, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface CustomerBasicInfoProps {
  profile: any;
}

export const CustomerBasicInfo = ({ profile }: CustomerBasicInfoProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile.full_name || '',
    phone_number: profile.phone_number || '',
    address: profile.address || '',
    driver_license: profile.driver_license || '',
    nationality: profile.nationality || '',
    email: profile.email || ''
  });
  const queryClient = useQueryClient();

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(formData)
        .eq('id', profile.id);

      if (error) throw error;

      toast.success('Profile updated successfully');
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['customer-profile'] });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: profile.full_name || '',
      phone_number: profile.phone_number || '',
      address: profile.address || '',
      driver_license: profile.driver_license || '',
      nationality: profile.nationality || '',
      email: profile.email || ''
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Basic Information</h3>
        {!isEditing ? (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Full Name</Label>
          {isEditing ? (
            <Input
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="Enter full name"
            />
          ) : (
            <p className="text-lg font-medium">{profile.full_name || 'N/A'}</p>
          )}
        </div>

        <div>
          <Label>Phone Number</Label>
          {isEditing ? (
            <Input
              value={formData.phone_number}
              onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              placeholder="Enter phone number"
            />
          ) : (
            <p className="text-lg font-medium">{profile.phone_number || 'N/A'}</p>
          )}
        </div>

        <div>
          <Label>Email</Label>
          {isEditing ? (
            <Input
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter email"
              type="email"
            />
          ) : (
            <p className="text-lg font-medium">{profile.email || 'N/A'}</p>
          )}
        </div>

        <div>
          <Label>Nationality</Label>
          {isEditing ? (
            <Input
              value={formData.nationality}
              onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
              placeholder="Enter nationality"
            />
          ) : (
            <p className="text-lg font-medium">{profile.nationality || 'N/A'}</p>
          )}
        </div>

        <div>
          <Label>Driver License</Label>
          {isEditing ? (
            <Input
              value={formData.driver_license}
              onChange={(e) => setFormData({ ...formData, driver_license: e.target.value })}
              placeholder="Enter driver license number"
            />
          ) : (
            <p className="text-lg font-medium">{profile.driver_license || 'N/A'}</p>
          )}
        </div>

        <div className="col-span-2">
          <Label>Address</Label>
          {isEditing ? (
            <Textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Enter full address"
            />
          ) : (
            <p className="text-lg font-medium">{profile.address || 'N/A'}</p>
          )}
        </div>
      </div>
    </div>
  );
};