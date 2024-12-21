import React from "react";
import { VehicleDiagram } from "../VehicleDiagram";

export const InspectionDamageSection = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Damage Assessment</h3>
      <VehicleDiagram
        damageMarkers={[]}
        onMarkersChange={() => {}}
      />
    </div>
  );
};