import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import SignaturePad from "react-signature-canvas";

interface SignatureCanvasProps {
  onSignatureCapture: (signature: string) => void;
}

export const SignatureCanvas = ({ onSignatureCapture }: SignatureCanvasProps) => {
  const signaturePadRef = useRef<SignaturePad>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  const handleClear = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
      setIsEmpty(true);
      onSignatureCapture("");
    }
  };

  const handleEnd = () => {
    if (signaturePadRef.current) {
      setIsEmpty(signaturePadRef.current.isEmpty());
      onSignatureCapture(signaturePadRef.current.toDataURL());
    }
  };

  return (
    <div className="space-y-2">
      <div className="border rounded-lg bg-white">
        <SignaturePad
          ref={signaturePadRef}
          canvasProps={{
            className: "w-full h-[200px]",
          }}
          onEnd={handleEnd}
        />
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={handleClear}
        disabled={isEmpty}
      >
        Clear Signature
      </Button>
    </div>
  );
};