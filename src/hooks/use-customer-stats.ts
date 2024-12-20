import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCustomerStats = () => {
  return useQuery({
    queryKey: ["customer-stats"],
    queryFn: async () => {
      // Get active customers
      const { data: activeCustomers, error: activeError } = await supabase
        .from("profiles")
        .select("id, leases!inner(status)")
        .eq("role", "customer")
        .eq("leases.status", "active");

      if (activeError) throw activeError;

      // Get inactive customers (with closed leases only)
      const { data: inactiveCustomers, error: inactiveError } = await supabase
        .from("profiles")
        .select("id")
        .eq("role", "customer")
        .not("id", "in", `(${activeCustomers.map(c => c.id).join(",")})`);

      if (inactiveError) throw inactiveError;

      return {
        activeCount: activeCustomers?.length || 0,
        inactiveCount: inactiveCustomers?.length || 0,
        total: (activeCustomers?.length || 0) + (inactiveCustomers?.length || 0)
      };
    },
  });
};