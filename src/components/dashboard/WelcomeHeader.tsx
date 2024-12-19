import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Clock } from "lucide-react";

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

  const getCurrentTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="relative overflow-hidden rounded-xl border bg-gradient-to-r from-violet-50 to-fuchsia-50 p-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            {getCurrentTimeGreeting()}, {profile?.full_name || 'User'}
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your rental fleet today.
          </p>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground bg-white/50 px-4 py-2 rounded-lg backdrop-blur-sm">
          <Clock className="h-4 w-4" />
          <span className="text-sm">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute right-0 top-0 -z-10 h-full w-1/3 bg-gradient-to-l from-[#9b87f5]/10 to-transparent" />
      <div className="absolute bottom-0 left-0 -z-10 h-1/3 w-full bg-gradient-to-t from-[#9b87f5]/5 to-transparent" />
    </div>
  );
};