
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { Sun, Moon, Sunset, Coffee, Sparkles } from "lucide-react";

const motivationalQuotes = [
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "The only way to do great work is to love what you do.",
  "Believe you can and you're halfway there.",
  "Quality means doing it right when no one is looking.",
  "The best way to predict the future is to create it.",
  "Excellence is not a skill, it's an attitude.",
  "Make each day your masterpiece.",
  "The road to success is always under construction.",
];

export const WelcomeHeader = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [quote, setQuote] = useState("");

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      return profile;
    },
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    setQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);

    return () => clearInterval(timer);
  }, []);

  const getGreetingIcon = () => {
    const hour = currentTime.getHours();
    if (hour < 6) return <Moon className="h-6 w-6 text-indigo-400" />;
    if (hour < 12) return <Sun className="h-6 w-6 text-amber-400" />;
    if (hour < 17) return <Coffee className="h-6 w-6 text-orange-400" />;
    if (hour < 20) return <Sunset className="h-6 w-6 text-rose-400" />;
    return <Moon className="h-6 w-6 text-indigo-400" />;
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-2 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-3">
          {getGreetingIcon()}
          <h1 className="text-2xl font-bold text-foreground">
            {getGreeting()}, {profile?.full_name || 'User'}
          </h1>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="hidden sm:inline">•</span>
          {format(currentTime, "EEEE, MMMM do, yyyy • h:mm a")}
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground/80 italic bg-primary/5 p-3 rounded-lg">
        <Sparkles className="h-4 w-4 text-primary/60 flex-shrink-0" />
        <p>"{quote}"</p>
      </div>
    </div>
  );
};
