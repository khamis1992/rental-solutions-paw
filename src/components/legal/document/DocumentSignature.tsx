import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import SignaturePad from "react-signature-canvas";
import { FileSignature, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";

interface DocumentSignatureProps {
  onSignatureCapture: (signature: string) => void;
  signatureStatus: string;
  disabled?: boolean;
}

export function DocumentSignature({ 
  onSignatureCapture, 
  signatureStatus,
  disabled = false 
}: DocumentSignatureProps) {
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
    } else {
      toast.error("Please provide a signature");
    }
  };

  if (signatureStatus === 'signed') {
    return (
      <Card className="p-4 bg-green-50 border-green-200">
        <div className="flex items-center gap-2">
          <FileSignature className="h-4 w-4 text-green-500" />
          <h3 className="text-sm font-medium text-green-700">Document Signed</h3>
        </div>
        <p className="text-sm text-green-600 mt-2">
          This document has been successfully signed and recorded.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileSignature className="h-4 w-4" />
          <h3 className="text-sm font-medium">Digital Signature</h3>
        </div>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm"
          onClick={handleClear}
          disabled={disabled}
          className="h-8 px-2"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Clear
        </Button>
      </div>
      
      <div className="border rounded-lg bg-white overflow-hidden">
        <SignaturePad
          ref={(ref) => setSignaturePad(ref)}
          canvasProps={{
            className: "w-full h-[200px]",
          }}
          disabled={disabled}
        />
      </div>
      
      <Button 
        type="button" 
        onClick={handleSave}
        disabled={disabled}
        className="w-full"
      >
        <FileSignature className="h-4 w-4 mr-2" />
        Save Signature
      </Button>
    </Card>
  );
}