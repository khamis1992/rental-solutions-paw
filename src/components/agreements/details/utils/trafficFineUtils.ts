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
  console.log('Starting delete all traffic fines operation');
  
  try {
    // Delete all records without any filtering
    const { data, error } = await supabase
      .from('traffic_fines')
      .delete()
      .then(response => {
        console.log('Delete operation response:', response);
        return response;
      })
      .catch(err => {
        console.error('Delete operation failed:', err);
        throw err;
      });

    if (error) {
      console.error('Error deleting traffic fines:', {
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      throw error;
    }

    console.log('Successfully deleted traffic fines:', data);
    return true;
  } catch (error: any) {
    console.error('Delete operation failed with error:', {
      error,
      message: error.message,
      details: error?.details,
      stack: error?.stack
    });
    throw error;
  }
};