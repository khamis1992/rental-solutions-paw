
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-200 relative group",
      "bg-gradient-to-br from-background/50 to-background/10 backdrop-blur-sm",
      "border border-border/50 dark:border-border/20",
      "touch-manipulation active:scale-[0.98] w-[85vw] sm:w-auto flex-shrink-0",
      "hover:shadow-lg hover:shadow-primary/5 dark:hover:shadow-primary/10",
      "sm:hover:scale-[1.02] sm:hover:-translate-y-0.5",
      className
    )}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="rounded-full p-2.5 bg-primary/10 dark:bg-primary/5">
          <Icon className={cn(
            "h-4 w-4 flex-shrink-0 transition-all",
            "group-hover:scale-110 group-active:scale-95",
            "text-primary/70 dark:text-primary/60",
            iconClassName
          )} />
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="text-2xl font-bold tracking-tight break-words">
          {value}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground mt-2 opacity-90">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
