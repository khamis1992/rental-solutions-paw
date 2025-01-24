import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Upload, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";

interface MobileVehicleDetailsProps {
  vehicleId: string;
  make: string;
  model: string;
  year?: number;
  licensePlate?: string;
  vin?: string;
}

export const MobileVehicleDetails = ({
  vehicleId,
  make,
  model,
  year,
  licensePlate,
  vin
}: MobileVehicleDetailsProps) => {
  const [showDamageReport, setShowDamageReport] = useState(false);
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const isMobile = useIsMobile();

  const handlePhotoCapture = async () => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.multiple = true;
      input.capture = 'environment';
      
      input.onchange = (e: Event) => {
        const files = (e.target as HTMLInputElement).files;
        if (files) {
          setPhotos(Array.from(files));
        }
      };
      
      input.click();
    } catch (error) {
      console.error('Error capturing photo:', error);
      toast.error('Failed to capture photo');
    }
  };

  const handleSubmitDamage = async () => {
    if (!description) {
      toast.error('Please provide a damage description');
      return;
    }

    setSubmitting(true);
    try {
      // Upload photos to storage
      const uploadedUrls = await Promise.all(
        photos.map(async (photo) => {
          const fileExt = photo.name.split('.').pop();
          const filePath = `${vehicleId}/${Date.now()}.${fileExt}`;
          
          const { error: uploadError, data } = await supabase.storage
            .from('inspection_photos')
            .upload(filePath, photo);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('inspection_photos')
            .getPublicUrl(filePath);

          return publicUrl;
        })
      );

      // Create damage report
      const { error } = await supabase
        .from('damages')
        .insert({
          vehicle_id: vehicleId,
          description,
          images: uploadedUrls,
          status: 'reported'
        });

      if (error) throw error;

      toast.success('Damage report submitted successfully');
      setDescription("");
      setPhotos([]);
      setShowDamageReport(false);
    } catch (error) {
      console.error('Error submitting damage report:', error);
      toast.error('Failed to submit damage report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 p-4 max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Make</Label>
              <p className="text-sm">{make}</p>
            </div>
            <div>
              <Label>Model</Label>
              <p className="text-sm">{model}</p>
            </div>
            {year && (
              <div>
                <Label>Year</Label>
                <p className="text-sm">{year}</p>
              </div>
            )}
            {licensePlate && (
              <div>
                <Label>License Plate</Label>
                <p className="text-sm">{licensePlate}</p>
              </div>
            )}
            {vin && (
              <div className="col-span-2">
                <Label>VIN</Label>
                <p className="text-sm">{vin}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {!showDamageReport ? (
        <Button 
          className="w-full" 
          onClick={() => setShowDamageReport(true)}
          variant="destructive"
        >
          <AlertTriangle className="mr-2 h-4 w-4" />
          Report Damage
        </Button>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Report Damage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Damage Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the damage..."
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label>Photos</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={handlePhotoCapture}
                  variant="outline"
                  className="w-full"
                >
                  {isMobile ? (
                    <Camera className="mr-2 h-4 w-4" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  {isMobile ? 'Take Photo' : 'Upload Photos'}
                </Button>
              </div>
              {photos.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {photos.length} photo(s) selected
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setShowDamageReport(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitDamage}
                disabled={submitting}
                className="w-full"
              >
                {submitting ? "Submitting..." : "Submit Report"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};