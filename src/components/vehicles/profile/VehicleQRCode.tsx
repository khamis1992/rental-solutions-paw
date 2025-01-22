import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VehicleQRCodeProps {
  vehicleId: string;
  make: string;
  model: string;
}

export const VehicleQRCode = ({ vehicleId, make, model }: VehicleQRCodeProps) => {
  const qrValue = `${window.location.origin}/vehicles/${vehicleId}`;

  const handleDownload = () => {
    const svg = document.querySelector("#vehicle-qr-code svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      
      const downloadLink = document.createElement("a");
      downloadLink.download = `${make}-${model}-QR.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          Vehicle QR Code
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <div id="vehicle-qr-code">
          <QRCodeSVG
            value={qrValue}
            size={200}
            level="H"
            includeMargin
          />
        </div>
        <Button onClick={handleDownload} variant="outline">
          Download QR Code
        </Button>
      </CardContent>
    </Card>
  );
};