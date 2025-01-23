import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface ReportCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  className?: string;
  onClick?: () => void;
  isSelected?: boolean;
}

export const ReportCard = ({
  title,
  description,
  icon: Icon,
  className,
  onClick,
  isSelected
}: ReportCardProps) => {
  return (
    <Card 
      className={cn(
        "transition-all cursor-pointer hover:shadow-md",
        isSelected && "ring-2 ring-primary",
        className
      )}
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        {/* Content specific to each report type can be added here */}
      </CardContent>
    </Card>
  );
};