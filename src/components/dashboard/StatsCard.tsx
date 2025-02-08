
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
      "overflow-hidden transition-all duration-200 hover:shadow-lg relative group snap-center min-w-[280px] sm:min-w-0",
      "bg-white/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800",
      "hover:scale-[1.02] active:scale-[0.98] touch-action-manipulation",
      className
    )}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/0 opacity-50 group-hover:opacity-70 transition-opacity" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
        <CardTitle className="text-base font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center transition-transform group-hover:scale-110">
          <Icon className={cn("h-5 w-5 text-primary", iconClassName)} />
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="text-2xl font-bold tracking-tight break-words transition-colors group-hover:text-primary">
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
