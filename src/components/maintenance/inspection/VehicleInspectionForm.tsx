import React, { useState } from "react";
import { InspectionBasicInfo } from "./sections/InspectionBasicInfo";
import { InspectionDamageSection } from "./sections/InspectionDamageSection";
import { InspectionSignatures } from "./sections/InspectionSignatures";
import { InspectionPhotos } from "./sections/InspectionPhotos";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface VehicleInspectionFormProps {
  maintenanceId: string;
}

const VehicleInspectionForm = ({ maintenanceId }: VehicleInspectionFormProps) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 16),
    inspector: "",
    odometer: "",
    fuelLevel: 100,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get vehicle ID from maintenance record
      const { data: maintenance, error: maintenanceError } = await supabase
        .from("maintenance")
        .select("vehicle_id")
        .eq("id", maintenanceId)
        .single();

      if (maintenanceError) throw maintenanceError;

      // Generate PDF
      const { data: pdfData, error: pdfError } = await supabase.functions.invoke(
        "generate-inspection-pdf",
        {
          body: {
            maintenanceId,
            vehicleId: maintenance.vehicle_id,
          },
        }
      );

      if (pdfError) throw pdfError;

      toast.success("Inspection completed and PDF generated successfully");
      navigate("/maintenance");
    } catch (error: any) {
      console.error("Error completing inspection:", error);
      toast.error(error.message || "Failed to complete inspection");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <InspectionBasicInfo
        formData={formData}
        onInputChange={handleInputChange}
      />
      <InspectionDamageSection />
      <InspectionPhotos />
      <InspectionSignatures />
      
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Completing Inspection..." : "Complete Inspection & Generate PDF"}
      </Button>
    </form>
  );
};

export default VehicleInspectionForm;