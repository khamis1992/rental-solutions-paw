import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { VehicleDiagram } from "./VehicleDiagram";
import { SignatureCanvas } from "./SignatureCanvas";
import { ImageUpload } from "./ImageUpload";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Car, Calendar, User, Gauge, Fuel } from "lucide-react";

interface VehicleInspectionFormProps {
  maintenanceId: string;
}

const VehicleInspectionForm = ({ maintenanceId }: VehicleInspectionFormProps) => {
  const { toast } = useToast();
  const [damageMarkers, setDamageMarkers] = useState<any[]>([]);
  const [fuelLevel, setFuelLevel] = useState<number>(100);
  const [renterSignature, setRenterSignature] = useState<string>("");
  const [staffSignature, setStaffSignature] = useState<string>("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [inspectionType, setInspectionType] = useState<'check_in' | 'check_out'>('check_in');

  useEffect(() => {
    // Fetch maintenance record to get vehicle ID
    const fetchMaintenanceDetails = async () => {
      const { data, error } = await supabase
        .from('maintenance')
        .select('vehicle_id')
        .eq('id', maintenanceId)
        .single();

      if (error) {
        console.error('Error fetching maintenance details:', error);
        toast({
          title: "Error",
          description: "Failed to load maintenance details.",
          variant: "destructive",
        });
        return;
      }

      if (data) {
        setVehicleId(data.vehicle_id);
      }
    };

    fetchMaintenanceDetails();
  }, [maintenanceId, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!vehicleId) throw new Error('Vehicle ID not found');

      const formData = new FormData(e.target as HTMLFormElement);
      
      const inspectionData = {
        vehicle_id: vehicleId,
        maintenance_id: maintenanceId,
        inspection_type: inspectionType,
        odometer_reading: parseInt(formData.get('odometer') as string),
        fuel_level: fuelLevel,
        damage_markers: damageMarkers,
        renter_signature: renterSignature,
        staff_signature: staffSignature,
        inspection_date: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('vehicle_inspections')
        .insert([inspectionData]);

      if (error) throw error;

      toast({
        title: "Inspection Saved",
        description: "Vehicle inspection has been recorded successfully.",
      });
    } catch (error) {
      console.error('Error saving inspection:', error);
      toast({
        title: "Error",
        description: "Failed to save inspection. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Vehicle Inspection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">
                <Calendar className="h-4 w-4 inline mr-2" />
                Inspection Date
              </Label>
              <Input
                id="date"
                name="date"
                type="datetime-local"
                defaultValue={new Date().toISOString().slice(0, 16)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inspector">
                <User className="h-4 w-4 inline mr-2" />
                Inspector Name
              </Label>
              <Input
                id="inspector"
                name="inspector"
                type="text"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="odometer">
                <Gauge className="h-4 w-4 inline mr-2" />
                Odometer Reading
              </Label>
              <Input
                id="odometer"
                name="odometer"
                type="number"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>
                <Fuel className="h-4 w-4 inline mr-2" />
                Fuel Level
              </Label>
              <Slider
                value={[fuelLevel]}
                onValueChange={(value) => setFuelLevel(value[0])}
                max={100}
                step={1}
              />
              <span className="text-sm text-muted-foreground">{fuelLevel}%</span>
            </div>
          </div>

          {/* Vehicle Diagram */}
          <VehicleDiagram
            damageMarkers={damageMarkers}
            onMarkersChange={setDamageMarkers}
          />

          {/* Photo Upload */}
          <ImageUpload
            onImagesSelected={setPhotos}
            maxFiles={5}
          />

          {/* Signatures */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Renter Signature</Label>
              <SignatureCanvas
                onSignatureCapture={setRenterSignature}
              />
            </div>
            <div>
              <Label>Staff Signature</Label>
              <SignatureCanvas
                onSignatureCapture={setStaffSignature}
              />
            </div>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Inspection"}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
};

export default VehicleInspectionForm;
