
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { Sun, Moon, Cloud, CloudDrizzle } from "lucide-react";

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
  const [quoteIndex, setQuoteIndex] = useState(0);

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

    setQuote(motivationalQuotes[quoteIndex]);

    return () => clearInterval(timer);
  }, [quoteIndex]);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const getTimeIcon = () => {
    const hour = currentTime.getHours();
    if (hour >= 6 && hour < 12) return <Sun className="h-6 w-6 text-amber-500 animate-pulse" />;
    if (hour >= 12 && hour < 17) return <Sun className="h-6 w-6 text-amber-500" />;
    if (hour >= 17 && hour < 20) return <Cloud className="h-6 w-6 text-blue-400" />;
    return <Moon className="h-6 w-6 text-blue-300" />;
  };

  const handleQuoteChange = () => {
    setQuoteIndex((prev) => (prev + 1) % motivationalQuotes.length);
  };

  return (
    <div className="space-y-2 p-6 rounded-xl bg-gradient-to-br from-background via-background/80 to-background/50 border shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-3">
          {getTimeIcon()}
          <h1 className="text-2xl font-bold text-foreground">
            {getGreeting()}, {profile?.full_name || 'User'}
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          {format(currentTime, "EEEE, MMMM do, yyyy • h:mm a")}
        </p>
      </div>
      <div 
        className="p-4 rounded-lg bg-gradient-to-r from-primary/5 to-primary/10 cursor-pointer touch-action-manipulation"
        onClick={handleQuoteChange}
      >
        <p className="text-sm text-muted-foreground/80 italic animate-fade-in">
          "{quote}"
        </p>
      </div>
    </div>
  );
};
