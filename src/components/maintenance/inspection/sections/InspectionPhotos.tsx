import React from "react";
import { ImageUpload } from "../ImageUpload";

export const InspectionPhotos = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Inspection Photos</h3>
      <ImageUpload
        onImagesSelected={() => {}}
        maxFiles={5}
      />
    </div>
  );
};