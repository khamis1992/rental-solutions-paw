import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const WelcomeHeader = () => {
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log('No authenticated user found');
          return null;
        }

        console.log('Fetching profile for user:', user.id);
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching profile:', error);
          return null;
        }

        console.log('Profile data:', profile);
        return profile;
      } catch (error) {
        console.error('Unexpected error in profile fetch:', error);
        return null;
      }
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Loading...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Error in WelcomeHeader:', error);
  }

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