import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QRCodeSVG } from "qrcode.react";

export interface VehicleQRCodeProps {
  make: string;
  model: string;
  vehicleId?: string;
}

export const VehicleQRCode = ({ make, model, vehicleId }: VehicleQRCodeProps) => {
  const qrData = JSON.stringify({
    make,
    model,
    id: vehicleId
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vehicle QR Code</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center">
        <QRCodeSVG
          value={qrData}
          size={200}
          level="H"
          includeMargin={true}
        />
      </CardContent>
    </Card>
  );
};