import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface VehicleInsuranceCellProps {
  vehicleId: string;
  isEditing: boolean;
  insurance: string;
  onEditStart: () => void;
  onEditEnd: () => void;
}

export const VehicleInsuranceCell = ({
  vehicleId,
  isEditing,
  insurance,
  onEditStart,
  onEditEnd
}: VehicleInsuranceCellProps) => {
  const [value, setValue] = useState(insurance);

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from("vehicles")
        .update({ insurance_company: value })
        .eq("id", vehicleId);

      if (error) throw error;
      toast.success("Insurance company updated successfully");
      onEditEnd();
    } catch (error) {
      console.error("Error updating insurance company:", error);
      toast.error("Failed to update insurance company");
    }
  };

  if (!isEditing) {
    return (
      <div className="flex items-center justify-between">
        <span>{insurance}</span>
        <Button variant="ghost" size="sm" onClick={onEditStart}>
          Edit
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="h-8"
      />
      <Button variant="ghost" size="sm" onClick={handleSave}>
        <Check className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={onEditEnd}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};