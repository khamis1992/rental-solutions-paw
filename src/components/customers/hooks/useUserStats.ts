import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useUserStats = () => {
  return useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => {
      console.log('Fetching user stats...');
      
      // Get customer count
      const { count: customerCount, error: customerError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'customer');

      if (customerError) {
        console.error('Error counting customers:', customerError);
        throw customerError;
      }

      // Get admin count
      const { count: adminCount, error: adminError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'admin');

      if (adminError) {
        console.error('Error counting admins:', adminError);
        throw adminError;
      }

      return {
        customerCount: customerCount || 0,
        adminCount: adminCount || 0
      };
    },
  });
};