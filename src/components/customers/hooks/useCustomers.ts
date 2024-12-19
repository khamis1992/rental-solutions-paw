import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useCustomers = (searchQuery: string) => {
  return useQuery({
    queryKey: ['customers', searchQuery],
    queryFn: async () => {
      try {
        console.log("Fetching customers with search:", searchQuery);
        let query = supabase
          .from('profiles')
          .select('id, full_name, phone_number, driver_license, id_document_url, license_document_url, role, address, contract_document_url, created_at')
          .eq('role', 'customer');

        if (searchQuery) {
          query = query.or(`full_name.ilike.%${searchQuery}%,phone_number.ilike.%${searchQuery}%,driver_license.ilike.%${searchQuery}%`);
        }

        const { data, error } = await query;

        if (error) {
          console.error("Error fetching customers:", error);
          toast.error("Failed to fetch customers");
          throw error;
        }
        
        console.log("Fetched customers:", data?.length || 0, "records");
        return data || [];
      } catch (err) {
        console.error("Error in customer query:", err);
        toast.error("Failed to fetch customers");
        return [];
      }
    },
    retry: 1,
    staleTime: 30000,
  });
};