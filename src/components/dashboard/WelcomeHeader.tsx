import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const WelcomeHeader = () => {
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      return profile;
    },
  });

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, {profile?.full_name || 'User'}
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's what's happening with your rental fleet today.
        </p>
      </div>
    </div>
  );
};