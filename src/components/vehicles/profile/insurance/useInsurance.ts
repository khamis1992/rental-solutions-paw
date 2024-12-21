import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { InsuranceFormData } from "./types";
import { toast } from "sonner";

export const useInsurance = (vehicleId: string) => {
  const queryClient = useQueryClient();

  const { data: insurance, isLoading } = useQuery({
    queryKey: ["vehicle-insurance", vehicleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicle_insurance")
        .select("*")
        .eq("vehicle_id", vehicleId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (formData: InsuranceFormData) => {
      const { error } = await supabase
        .from("vehicle_insurance")
        .upsert({
          ...formData,
          vehicle_id: vehicleId,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicle-insurance", vehicleId] });
      toast.success("Insurance information saved successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to save insurance information: ${error.message}`);
    },
  });

  return {
    insurance,
    isLoading,
    saveMutation,
  };
};