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
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium text-muted-foreground truncate">
          {title}
        </CardTitle>
        <Icon className={cn("h-5 w-5 flex-shrink-0", iconClassName)} />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight truncate">
          {value}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground mt-2 truncate">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};