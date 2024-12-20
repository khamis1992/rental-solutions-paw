import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: React.ReactNode;
  className?: string;
  iconClassName?: string;  // Added this prop
}

export const StatsCard = ({
  title,
  value,
  icon: Icon,
  description,
  className,
  iconClassName,  // Added this prop
}: StatsCardProps) => {
  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-center w-full">{title}</CardTitle>
        <Icon className={cn("h-4 w-4 text-muted-foreground shrink-0", iconClassName)} />
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <div className="text-xs text-muted-foreground mt-1 text-center">{description}</div>
        )}
      </CardContent>
    </Card>
  );
};