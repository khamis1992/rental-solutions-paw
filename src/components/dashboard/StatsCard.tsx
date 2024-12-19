import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  description?: React.ReactNode;
  trend?: "up" | "down";
  className?: string;
}

export const StatsCard = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className,
}: StatsCardProps) => {
  return (
    <div className={cn(
      "rounded-xl border bg-gradient-to-br from-white to-gray-50/50 p-6 transition-all hover:shadow-lg",
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {description && (
            <p className="text-xs text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        <div className={cn(
          "rounded-lg p-2",
          trend === "up" ? "bg-emerald-50 text-emerald-600" :
          trend === "down" ? "bg-rose-50 text-rose-600" :
          "bg-blue-50 text-blue-600"
        )}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};