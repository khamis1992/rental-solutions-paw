import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

interface InspectionBasicInfoProps {
  formData: {
    date: string;
    inspector: string;
    odometer: string;
    fuelLevel: number;
  };
  onInputChange: (field: string, value: string | number) => void;
}

export const InspectionBasicInfo = ({
  formData,
  onInputChange,
}: InspectionBasicInfoProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="date">Inspection Date</Label>
        <Input
          id="date"
          name="date"
          type="datetime-local"
          value={formData.date}
          onChange={(e) => onInputChange("date", e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="inspector">Inspector Name</Label>
        <Input
          id="inspector"
          name="inspector"
          type="text"
          value={formData.inspector}
          onChange={(e) => onInputChange("inspector", e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="odometer">Odometer Reading</Label>
        <Input
          id="odometer"
          name="odometer"
          type="number"
          value={formData.odometer}
          onChange={(e) => onInputChange("odometer", e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Fuel Level</Label>
        <Slider
          value={[formData.fuelLevel]}
          onValueChange={(value) => onInputChange("fuelLevel", value[0])}
          max={100}
          step={1}
        />
        <span className="text-sm text-muted-foreground">{formData.fuelLevel}%</span>
      </div>
    </div>
  );
};