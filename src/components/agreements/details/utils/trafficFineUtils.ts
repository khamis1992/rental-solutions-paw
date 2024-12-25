import { supabase } from "@/integrations/supabase/client";
import { TrafficFine } from "@/types/traffic-fines";

export const fetchTrafficFines = async (agreementId: string): Promise<TrafficFine[]> => {
  const { data, error } = await supabase
    .from('traffic_fines')
    .select(`
      *,
      lease:leases(
        id,
        customer_id,
        customer:profiles(
          id,
          full_name
        ),
        vehicle:vehicles(
          make,
          model,
          year,
          license_plate
        )
      )
    `)
    .eq('lease_id', agreementId)
    .order('violation_date', { ascending: false });

  if (error) {
    console.error('Error fetching traffic fines:', error);
    throw error;
  }

  return data as TrafficFine[];
};

export const deleteAllTrafficFines = async () => {
  console.log('Attempting to delete all traffic fines');
  
  const { data, error } = await supabase
    .from('traffic_fines')
    .delete()
    .neq('id', null) // This ensures we have a WHERE clause while deleting all records
    .select();

  if (error) {
    console.error('Error deleting traffic fines:', error);
    throw error;
  }

  console.log('Successfully deleted traffic fines:', data);
  return data;
};