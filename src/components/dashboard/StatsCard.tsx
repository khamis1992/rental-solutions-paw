
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useTouchGestures } from "@/hooks/use-touch-gestures";
import { useRef } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: React.ReactNode;
  className?: string;
  iconClassName?: string;
}

export const StatsCard = ({
  title,
  value,
  icon: Icon,
  description,
  className,
  iconClassName,
}: StatsCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Add touch gesture support
  useTouchGestures(cardRef, {
    onSwipeLeft: () => console.log('Swiped left'),
    onSwipeRight: () => console.log('Swiped right'),
  });

  return (
    <TooltipProvider>
      <Card 
        ref={cardRef}
        className={cn(
          // Base card styles
          "overflow-hidden relative group cursor-pointer",
          "w-[85vw] sm:w-auto flex-shrink-0",
          
          // Glassmorphism effect
          "bg-gradient-to-br from-background/50 via-background/30 to-background/10",
          "backdrop-blur-md border border-white/10 dark:border-white/5",
          
          // Shadow and hover effects
          "shadow-lg shadow-primary/5 dark:shadow-primary/10",
          "hover:shadow-xl hover:shadow-primary/10 dark:hover:shadow-primary/20",
          
          // Mobile touch animations
          "active:scale-[0.98] touch-manipulation",
          "transition-all duration-300 ease-out",
          
          // Desktop hover animations
          "sm:hover:scale-[1.02] sm:hover:-translate-y-1",
          
          className
        )}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              {/* Gradient overlay */}
              <div 
                className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent 
                         opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
              
              {/* Card Header */}
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-muted-foreground/90 group-hover:text-muted-foreground">
                  {title}
                </CardTitle>
                <div className="rounded-full p-3 bg-primary/10 dark:bg-primary/5 
                            group-hover:bg-primary/15 dark:group-hover:bg-primary/10 
                            transition-colors duration-300">
                  <Icon className={cn(
                    "h-5 w-5 flex-shrink-0",
                    "transform transition-all duration-300",
                    "group-hover:scale-110 group-active:scale-95",
                    "text-primary/70 dark:text-primary/60 group-hover:text-primary/90",
                    iconClassName
                  )} />
                </div>
              </CardHeader>
              
              {/* Card Content */}
              <CardContent className="relative z-10">
                <div className="text-2xl font-bold tracking-tight break-words 
                            bg-gradient-to-br from-foreground to-foreground/70 
                            bg-clip-text text-transparent">
                  {value}
                </div>
                {description && (
                  <p className="text-sm text-muted-foreground mt-2 opacity-90 
                             group-hover:opacity-100 transition-opacity">
                    {description}
                  </p>
                )}
              </CardContent>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{title}: {value}</p>
          </TooltipContent>
        </Tooltip>
      </Card>
    </TooltipProvider>
  );
};
