import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const WelcomeHeader = () => {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        return profile;
      } catch (error) {
        console.error('Error in profile fetch:', error);
        return null;
      }
    },
  });

  if (isLoading) {
    return (
      <div className="mb-4">
        <div className="h-6 w-48 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="mb-4">
      <h1 className="text-2xl font-semibold text-foreground">
        Welcome back, {profile?.full_name || 'User'}
      </h1>
    </div>
  );
};