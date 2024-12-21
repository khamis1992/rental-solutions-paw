import React from "react";
import { Label } from "@/components/ui/label";
import { SignatureCanvas } from "../SignatureCanvas";

export const InspectionSignatures = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label>Staff Signature</Label>
        <SignatureCanvas
          onSignatureCapture={() => {}}
        />
      </div>
      <div>
        <Label>Inspector Signature</Label>
        <SignatureCanvas
          onSignatureCapture={() => {}}
        />
      </div>
    </div>
  );
};