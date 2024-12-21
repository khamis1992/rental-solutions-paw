import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Customer } from "../types/customer";

interface UseCustomersOptions {
  searchQuery: string;
  page: number;
  pageSize: number;
}

interface UseCustomersResult {
  customers: Customer[];
  totalCount: number;
  error: Error | null;
}

export const useCustomers = ({ searchQuery, page, pageSize }: UseCustomersOptions) => {
  return useQuery({
    queryKey: ['customers', searchQuery, page, pageSize],
    queryFn: async (): Promise<UseCustomersResult> => {
      try {
        console.log("Fetching customers with search:", searchQuery);
        
        // First get total count for pagination
        const countQuery = supabase
          .from('profiles')
          .select('id', { count: 'exact' });

        if (searchQuery) {
          countQuery.or(`full_name.ilike.%${searchQuery}%,phone_number.ilike.%${searchQuery}%,driver_license.ilike.%${searchQuery}%`);
        }

        const { count, error: countError } = await countQuery;

        if (countError) {
          console.error("Error counting customers:", countError);
          throw countError;
        }

        // Then fetch paginated data - note we're not filtering by role here
        let query = supabase
          .from('profiles')
          .select('id, full_name, phone_number, driver_license, id_document_url, license_document_url, role, address, contract_document_url, created_at')
          .range(page * pageSize, (page + 1) * pageSize - 1)
          .order('created_at', { ascending: false });

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
        return {
          customers: (data || []) as Customer[],
          totalCount: count || 0,
          error: null
        };
      } catch (err) {
        console.error("Error in customer query:", err);
        toast.error("Failed to fetch customers");
        return {
          customers: [],
          totalCount: 0,
          error: err as Error
        };
      }
    },
    retry: 1,
    staleTime: 30000,
  });
};