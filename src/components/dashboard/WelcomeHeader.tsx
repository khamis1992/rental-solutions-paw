import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SearchBox } from "@/components/layout/SearchBox";

export const WelcomeHeader = () => {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log('No authenticated user found');
          return null;
        }

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching profile:', error);
          return null;
        }

        return profile;
      } catch (error) {
        console.error('Unexpected error in profile fetch:', error);
        return null;
      }
    },
  });

  return (
    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, {profile?.full_name || 'User'}
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your rental fleet today.
        </p>
      </div>
      <div className="w-full md:w-auto">
        <SearchBox />
      </div>
    </div>
  );
};