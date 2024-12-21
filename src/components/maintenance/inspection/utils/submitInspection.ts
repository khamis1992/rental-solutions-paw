import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";

interface DamageMarker {
  id: string;
  x: number;
  y: number;
  view: string;
  description: string;
  photoUrl?: string;
}

export const submitInspection = async ({
  maintenanceId,
  damageMarkers,
  photos,
  renterSignature,
  staffSignature,
  fuelLevel,
  formData
}: {
  maintenanceId: string;
  damageMarkers: DamageMarker[];
  photos: File[];
  renterSignature: string;
  staffSignature: string;
  fuelLevel: number;
  formData: FormData;
}) => {
  try {
    // First, get the vehicle_id from the maintenance record
    const { data: maintenanceData, error: maintenanceError } = await supabase
      .from('maintenance')
      .select('vehicle_id, id')
      .eq('id', maintenanceId)
      .single();

    if (maintenanceError) throw maintenanceError;
    if (!maintenanceData?.vehicle_id) throw new Error('Vehicle ID not found');

    // Upload inspection photos
    const uploadedPhotos = await Promise.all(
      photos.map(async (photo) => {
        const fileExt = photo.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${maintenanceData.vehicle_id}/${fileName}`;

        const { error: uploadError, data } = await supabase.storage
          .from('inspection_photos')
          .upload(filePath, photo);

        if (uploadError) throw uploadError;

        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('inspection_photos')
          .getPublicUrl(filePath);

        return publicUrl;
      })
    );

    // Create the inspection record with properly typed damage markers
    const inspectionData = {
      vehicle_id: maintenanceData.vehicle_id,
      inspection_type: 'check_in',
      odometer_reading: parseInt(formData.get('odometer') as string),
      fuel_level: fuelLevel,
      damage_markers: damageMarkers as unknown as Json,
      renter_signature: renterSignature,
      staff_signature: staffSignature,
      inspection_date: new Date().toISOString(),
      maintenance_id: maintenanceId,
      inspection_photos: uploadedPhotos,
      photos: uploadedPhotos // For backward compatibility
    };

    const { error: inspectionError } = await supabase
      .from('vehicle_inspections')
      .insert(inspectionData);

    if (inspectionError) throw inspectionError;

    // Create damage records for each marker
    if (damageMarkers.length > 0) {
      const damageRecords = damageMarkers.map(marker => ({
        lease_id: null, // Since this is from maintenance inspection
        vehicle_id: maintenanceData.vehicle_id,
        description: marker.description,
        reported_date: new Date().toISOString(),
        images: uploadedPhotos,
        status: 'reported',
        damage_location: `${marker.view} - X:${marker.x}% Y:${marker.y}%`,
        notes: `Damage reported during maintenance inspection ${maintenanceId}`
      }));

      const { error: damagesError } = await supabase
        .from('damages')
        .insert(damageRecords);

      if (damagesError) throw damagesError;
    }

    // Update maintenance status
    const { error: maintenanceUpdateError } = await supabase
      .from('maintenance')
      .update({ 
        status: 'in_progress',
        description: 'Inspection completed. Job card ready.',
        scheduled_date: new Date().toISOString()
      })
      .eq('id', maintenanceId);

    if (maintenanceUpdateError) throw maintenanceUpdateError;

    toast.success("Inspection saved successfully");
    return { success: true };
  } catch (error: any) {
    console.error('Error saving inspection:', error);
    toast.error("Failed to save inspection. Please try again.");
    return { success: false, error };
  }
};