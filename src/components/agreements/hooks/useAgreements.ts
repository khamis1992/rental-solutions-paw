import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Agreement {
  id: string;
  agreement_number: string | null;
  agreement_type: string;
  customer_id: string;
  vehicle_id: string;
  start_date: string | null;
  end_date: string | null;
  status: string;
  initial_mileage: number;
  return_mileage: number | null;
  total_amount: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  payment_status: string | null;
  last_payment_date: string | null;
  next_payment_date: string | null;
  payment_frequency: string | null;
  customer?: {
    id: string;
    full_name: string | null;
  };
  vehicle?: {
    id: string;
    make: string;
    model: string;
    year: number;
    license_plate: string;
  };
}

export const useAgreements = () => {
  return useQuery({
    queryKey: ["agreements"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("leases")
          .select(`
            *,
            customer:customer_id (
              id,
              full_name
            ),
            vehicle:vehicle_id (
              id,
              make,
              model,
              year,
              license_plate
            )
          `)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching agreements:", error);
          toast.error("Failed to fetch agreements");
          throw error;
        }

        return data as Agreement[];
      } catch (err) {
        console.error("Error in agreements query:", err);
        throw err;
      }
    },
    staleTime: 30000, // Consider data fresh for 30 seconds
  });
};