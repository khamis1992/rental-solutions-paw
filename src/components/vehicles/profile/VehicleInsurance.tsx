import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Edit2, Save } from "lucide-react";
import { InsuranceForm } from "./insurance/InsuranceForm";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { InsuranceFormData } from "./insurance/types";

interface VehicleInsuranceProps {
  vehicleId: string;
}

export const VehicleInsurance = ({ vehicleId }: VehicleInsuranceProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<InsuranceFormData>({
    vehicle_id: vehicleId,
    policy_number: "",
    provider: "",
    coverage_type: "",
    coverage_amount: 0,
    premium_amount: 0,
    start_date: "",
    end_date: "",
  });

  const { data: insurance, isLoading } = useQuery({
    queryKey: ["vehicle-insurance", vehicleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicle_insurance")
        .select("*")
        .eq("vehicle_id", vehicleId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (insurance) {
      setFormData({
        ...insurance,
        vehicle_id: vehicleId,
      });
    }
  }, [insurance, vehicleId]);

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from("vehicle_insurance")
        .upsert({
          ...formData,
          vehicle_id: vehicleId,
        });

      if (error) throw error;
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving insurance:", error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading insurance information...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

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
        <InsuranceForm
          formData={formData}
          setFormData={setFormData}
          isEditing={isEditing}
        />
      </CardContent>
    </Card>
  );
};