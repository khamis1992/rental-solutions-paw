import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Shield, Edit2, Save } from "lucide-react";
import { InsuranceForm } from "./insurance/InsuranceForm";
import { useInsurance } from "./insurance/useInsurance";
import { InsuranceFormData } from "./insurance/types";

interface VehicleInsuranceProps {
  vehicleId: string;
}

export const VehicleInsurance = ({ vehicleId }: VehicleInsuranceProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<InsuranceFormData>({
    policy_number: "",
    provider: "",
    coverage_type: "",
    coverage_amount: "",
    premium_amount: "",
    start_date: "",
    end_date: "",
  });

  const { insurance, saveMutation } = useInsurance(vehicleId);

  // Initialize form data when insurance data is loaded
  useEffect(() => {
    if (insurance) {
      setFormData({
        policy_number: insurance.policy_number,
        provider: insurance.provider,
        coverage_type: insurance.coverage_type,
        coverage_amount: insurance.coverage_amount.toString(),
        premium_amount: insurance.premium_amount.toString(),
        start_date: insurance.start_date,
        end_date: insurance.end_date,
      });
    }
  }, [insurance]);

  const handleSave = async () => {
    await saveMutation.mutateAsync(formData);
    setIsEditing(false);
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
        <InsuranceForm
          formData={formData}
          setFormData={setFormData}
          isEditing={isEditing}
        />
      </CardContent>
    </Card>
  );
};