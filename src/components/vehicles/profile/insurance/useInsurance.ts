import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Insurance } from "./types";

export const useInsurance = (vehicleId: string) => {
  const queryClient = useQueryClient();

  const { data: insurance, refetch } = useQuery({
    queryKey: ["vehicle-insurance", vehicleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicle_insurance")
        .select("*")
        .eq("vehicle_id", vehicleId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (formData: Partial<Insurance>) => {
      const { error } = insurance
        ? await supabase
            .from("vehicle_insurance")
            .update({
              ...formData,
              coverage_amount: parseFloat(formData.coverage_amount as string),
              premium_amount: parseFloat(formData.premium_amount as string),
            })
            .eq("vehicle_id", vehicleId)
        : await supabase.from("vehicle_insurance").insert([
            {
              vehicle_id: vehicleId,
              ...formData,
              coverage_amount: parseFloat(formData.coverage_amount as string),
              premium_amount: parseFloat(formData.premium_amount as string),
            },
          ]);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Insurance information saved successfully");
      queryClient.invalidateQueries({ queryKey: ["vehicle-insurance"] });
    },
    onError: (error) => {
      console.error("Error saving insurance information:", error);
      toast.error("Failed to save insurance information");
    },
  });

  return {
    insurance,
    refetch,
    saveMutation,
  };
};