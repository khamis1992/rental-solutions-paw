import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ProfileManagementProps {
  profile: {
    id: string;
    full_name?: string | null;
    phone_number?: string | null;
    email?: string | null;
    address?: string | null;
    nationality?: string | null;
  };
}

export const ProfileManagement = ({ profile }: ProfileManagementProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    phone_number: profile?.phone_number || "",
    email: profile?.email || "",
    address: profile?.address || "",
    nationality: profile?.nationality || ""
  });

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update(formData)
        .eq("id", profile.id);

      if (error) throw error;

      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Profile Information</CardTitle>
        {!isEditing && (
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            Edit Profile
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label>Full Name</Label>
            {isEditing ? (
              <Input
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
              />
            ) : (
              <p className="mt-1">{profile.full_name || "Not provided"}</p>
            )}
          </div>

          <div>
            <Label>Phone Number</Label>
            {isEditing ? (
              <Input
                value={formData.phone_number}
                onChange={(e) =>
                  setFormData({ ...formData, phone_number: e.target.value })
                }
              />
            ) : (
              <p className="mt-1">{profile.phone_number || "Not provided"}</p>
            )}
          </div>

          <div>
            <Label>Email</Label>
            {isEditing ? (
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            ) : (
              <p className="mt-1">{profile.email || "Not provided"}</p>
            )}
          </div>

          <div>
            <Label>Nationality</Label>
            {isEditing ? (
              <Input
                value={formData.nationality}
                onChange={(e) =>
                  setFormData({ ...formData, nationality: e.target.value })
                }
              />
            ) : (
              <p className="mt-1">{profile.nationality || "Not provided"}</p>
            )}
          </div>

          <div>
            <Label>Address</Label>
            {isEditing ? (
              <Textarea
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
            ) : (
              <p className="mt-1">{profile.address || "Not provided"}</p>
            )}
          </div>

          {isEditing && (
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    full_name: profile.full_name || "",
                    phone_number: profile.phone_number || "",
                    email: profile.email || "",
                    address: profile.address || "",
                    nationality: profile.nationality || ""
                  });
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};