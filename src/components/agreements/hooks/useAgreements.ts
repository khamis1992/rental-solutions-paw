import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AgreementWithRelations } from "@/types/database/agreement.types";

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

        // Transform the data to match AgreementWithRelations type
        const transformedData: AgreementWithRelations[] = data.map((item: any) => ({
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