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
    // Create a temporary canvas element
    const canvas = document.createElement('canvas');
    const svg = document.querySelector('.vehicle-qr-code svg');
    
    if (!svg) {
      console.error('QR Code SVG not found');
      return;
    }

    // Get SVG data
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);

    // Create image from SVG
    const img = new Image();
    img.onload = () => {
      // Set canvas dimensions
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw image to canvas
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        
        // Convert canvas to blob and download
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `vehicle-qr-${licensePlate || vehicleId}.png`;
            link.href = url;
            link.click();
            
            // Cleanup
            URL.revokeObjectURL(url);
          }
        }, 'image/png');
      }
    };
    img.src = svgUrl;
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
        <div className="vehicle-qr-code">
          <QRCodeSVG
            value={vehicleUrl}
            size={200}
            level="H"
            includeMargin={true}
          />
        </div>
        <p className="text-sm text-muted-foreground text-center">
          Scan this QR code to view vehicle details and report damages
        </p>
      </CardContent>
    </Card>
  );
};