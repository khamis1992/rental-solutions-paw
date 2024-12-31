import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import SignaturePad from "react-signature-canvas";
import { FileSignature } from "lucide-react";

interface DocumentSignatureProps {
  onSignatureCapture: (signature: string) => void;
  signatureStatus: string;
}

export function DocumentSignature({ onSignatureCapture, signatureStatus }: DocumentSignatureProps) {
  const [signaturePad, setSignaturePad] = useState<SignaturePad | null>(null);

  const handleClear = () => {
    if (signaturePad) {
      signaturePad.clear();
    }
  };

  const handleSave = () => {
    if (signaturePad && !signaturePad.isEmpty()) {
      const signature = signaturePad.toDataURL();
      onSignatureCapture(signature);
      toast.success("Signature saved successfully");
    } else {
      toast.error("Please provide a signature");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <FileSignature className="h-4 w-4" />
        <h3 className="text-sm font-medium">Digital Signature</h3>
      </div>
      <div className="border rounded-lg bg-white">
        <SignaturePad
          ref={(ref) => setSignaturePad(ref)}
          canvasProps={{
            className: "w-full h-[200px]",
          }}
        />
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={handleClear}>
          Clear
        </Button>
        <Button type="button" onClick={handleSave}>
          Save Signature
        </Button>
      </div>
    </div>
  );
}