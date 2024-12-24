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
    <Card className={cn("", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={cn("h-6 w-6", iconClassName)} />
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold mb-2">{value}</div>
        {description && (
          <p className="text-base text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};