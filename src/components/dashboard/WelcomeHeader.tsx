import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Clock } from "lucide-react";

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
      <div className="animate-pulse">
        <div className="h-8 w-64 bg-gray-200 rounded mb-2"></div>
        <div className="h-6 w-48 bg-gray-200 rounded"></div>
      </div>
    );
  }

  const currentTime = new Date();
  const hours = currentTime.getHours();
  let greeting = "Good morning";
  if (hours >= 12 && hours < 17) greeting = "Good afternoon";
  if (hours >= 17) greeting = "Good evening";

  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {greeting}, {profile?.full_name || 'User'}
        </h1>
        <p className="text-gray-600 flex items-center">
          <Clock className="w-4 h-4 mr-2" />
          {currentTime.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>
    </div>
  );
};