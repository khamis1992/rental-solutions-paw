import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";

export const useSmartSearch = (searchQuery: string) => {
  const debouncedSearch = useDebounce(searchQuery, 300);

  return useQuery({
    queryKey: ["legal-smart-search", debouncedSearch],
    queryFn: async () => {
      if (!debouncedSearch || debouncedSearch.length < 2) {
        return null;
      }

      try {
        const { data, error } = await supabase.functions.invoke("legal-smart-search", {
          body: { query: debouncedSearch }
        });

        if (error) throw error;
        return data.data;
      } catch (error) {
        console.error("Smart search error:", error);
        toast.error("Failed to perform search");
        throw error;
      }
    },
    enabled: debouncedSearch.length >= 2,
  });
};