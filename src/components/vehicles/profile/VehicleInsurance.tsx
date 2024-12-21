import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Shield, Edit2, Save } from "lucide-react";
import { toast } from "sonner";

interface VehicleInsuranceProps {
  vehicleId: string;
}

export const VehicleInsurance = ({ vehicleId }: VehicleInsuranceProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    policy_number: "",
    provider: "",
    coverage_type: "",
    coverage_amount: "",
    premium_amount: "",
    start_date: "",
    end_date: "",
  });

  const { data: insurance, refetch } = useQuery({
    queryKey: ["vehicle-insurance", vehicleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicle_insurance")
        .select("*")
        .eq("vehicle_id", vehicleId)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      if (data) {
        setFormData({
          policy_number: data.policy_number,
          provider: data.provider,
          coverage_type: data.coverage_type,
          coverage_amount: data.coverage_amount.toString(),
          premium_amount: data.premium_amount.toString(),
          start_date: data.start_date,
          end_date: data.end_date,
        });
      }
      return data;
    },
  });

  const handleSave = async () => {
    try {
      const { error } = insurance
        ? await supabase
            .from("vehicle_insurance")
            .update({
              ...formData,
              coverage_amount: parseFloat(formData.coverage_amount),
              premium_amount: parseFloat(formData.premium_amount),
            })
            .eq("vehicle_id", vehicleId)
        : await supabase.from("vehicle_insurance").insert([
            {
              vehicle_id: vehicleId,
              ...formData,
              coverage_amount: parseFloat(formData.coverage_amount),
              premium_amount: parseFloat(formData.premium_amount),
            },
          ]);

      if (error) throw error;

      toast.success("Insurance information saved successfully");
      setIsEditing(false);
      refetch();
    } catch (error) {
      console.error("Error saving insurance information:", error);
      toast.error("Failed to save insurance information");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            <CardTitle>Insurance Information</CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (isEditing) {
                handleSave();
              } else {
                setIsEditing(true);
              }
            }}
          >
            {isEditing ? (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save
              </>
            ) : (
              <>
                <Edit2 className="mr-2 h-4 w-4" />
                Edit
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Policy Number</label>
            {isEditing ? (
              <Input
                value={formData.policy_number}
                onChange={(e) =>
                  setFormData({ ...formData, policy_number: e.target.value })
                }
              />
            ) : (
              <p className="text-sm">{insurance?.policy_number || "N/A"}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Provider</label>
            {isEditing ? (
              <Input
                value={formData.provider}
                onChange={(e) =>
                  setFormData({ ...formData, provider: e.target.value })
                }
              />
            ) : (
              <p className="text-sm">{insurance?.provider || "N/A"}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Coverage Type</label>
            {isEditing ? (
              <Input
                value={formData.coverage_type}
                onChange={(e) =>
                  setFormData({ ...formData, coverage_type: e.target.value })
                }
              />
            ) : (
              <p className="text-sm">{insurance?.coverage_type || "N/A"}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Coverage Amount</label>
            {isEditing ? (
              <Input
                type="number"
                value={formData.coverage_amount}
                onChange={(e) =>
                  setFormData({ ...formData, coverage_amount: e.target.value })
                }
              />
            ) : (
              <p className="text-sm">
                {insurance?.coverage_amount
                  ? `$${insurance.coverage_amount.toLocaleString()}`
                  : "N/A"}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Premium Amount</label>
            {isEditing ? (
              <Input
                type="number"
                value={formData.premium_amount}
                onChange={(e) =>
                  setFormData({ ...formData, premium_amount: e.target.value })
                }
              />
            ) : (
              <p className="text-sm">
                {insurance?.premium_amount
                  ? `$${insurance.premium_amount.toLocaleString()}`
                  : "N/A"}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Start Date</label>
            {isEditing ? (
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) =>
                  setFormData({ ...formData, start_date: e.target.value })
                }
              />
            ) : (
              <p className="text-sm">
                {insurance?.start_date
                  ? new Date(insurance.start_date).toLocaleDateString()
                  : "N/A"}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">End Date</label>
            {isEditing ? (
              <Input
                type="date"
                value={formData.end_date}
                onChange={(e) =>
                  setFormData({ ...formData, end_date: e.target.value })
                }
              />
            ) : (
              <p className="text-sm">
                {insurance?.end_date
                  ? new Date(insurance.end_date).toLocaleDateString()
                  : "N/A"}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};