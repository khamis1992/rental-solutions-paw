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
  // Create a URL for the vehicle details
  const baseUrl = window.location.origin;
  const vehicleUrl = `${baseUrl}/m/vehicles/${vehicleId}`;

  // QR data now includes the URL and basic vehicle info
  const qrData = JSON.stringify({
    url: vehicleUrl,
    make,
    model,
    id: vehicleId,
    year,
    licensePlate,
    vin,
    qrType: 'vehicle-details'
  });

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
          value={qrData}
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