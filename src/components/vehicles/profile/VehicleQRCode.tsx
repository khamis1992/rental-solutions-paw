import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export interface VehicleQRCodeProps {
  make: string;
  model: string;
  vehicleId?: string;
  year?: number;
  licensePlate?: string;
  vin?: string;
}

export const VehicleQRCode = ({ 
  make, 
  model, 
  vehicleId,
  year,
  licensePlate,
  vin 
}: VehicleQRCodeProps) => {
  // Get the current window location to build the absolute URL
  const baseUrl = window.location.origin;
  const vehicleUrl = `${baseUrl}/vehicles/${vehicleId}`;

  const downloadQRCode = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `vehicle-qr-${licensePlate}.png`;
      link.href = url;
      link.click();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          Vehicle QR Code
          <Button variant="outline" size="sm" onClick={downloadQRCode}>
            <Download className="h-4 w-4 mr-2" />
            Download QR
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <QRCodeSVG
          value={vehicleUrl}
          size={200}
          level="H"
          includeMargin={true}
        />
        <p className="text-sm text-muted-foreground text-center">
          Scan this QR code to view vehicle details and report damages
        </p>
      </CardContent>
    </Card>
  );
};