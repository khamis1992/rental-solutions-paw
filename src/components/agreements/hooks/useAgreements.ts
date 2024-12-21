import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AgreementWithRelations } from "@/types/database/agreement.types";

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
  down_payment: number | null;
  monthly_payment: number | null;
  interest_rate: number | null;
  lease_duration: string | null;
  early_payoff_allowed: boolean | null;
  ownership_transferred: boolean | null;
  trade_in_value: number | null;
  late_fee_rate: number | null;
  late_fee_grace_period: string | null;
  damage_penalty_rate: number | null;
  fuel_penalty_rate: number | null;
  late_return_fee: number | null;
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

        // Transform the data to match Agreement type
        const transformedData: Agreement[] = data.map((item: any) => ({
          id: item.id,
          agreement_number: item.agreement_number,
          agreement_type: item.agreement_type,
          customer_id: item.customer_id,
          vehicle_id: item.vehicle_id,
          start_date: item.start_date,
          end_date: item.end_date,
          status: item.status,
          initial_mileage: item.initial_mileage,
          return_mileage: item.return_mileage,
          total_amount: item.total_amount,
          notes: item.notes,
          created_at: item.created_at,
          updated_at: item.updated_at,
          down_payment: item.down_payment,
          monthly_payment: item.monthly_payment,
          interest_rate: item.interest_rate,
          lease_duration: item.lease_duration,
          early_payoff_allowed: item.early_payoff_allowed,
          ownership_transferred: item.ownership_transferred,
          trade_in_value: item.trade_in_value,
          late_fee_rate: item.late_fee_rate,
          late_fee_grace_period: item.late_fee_grace_period,
          damage_penalty_rate: item.damage_penalty_rate,
          fuel_penalty_rate: item.fuel_penalty_rate,
          late_return_fee: item.late_return_fee,
          customer: item.customer,
          vehicle: item.vehicle
        }));

        return transformedData;
      } catch (err) {
        console.error("Error in agreements query:", err);
        throw err;
      }
    },
    staleTime: 30000, // Consider data fresh for 30 seconds
  });
};