import { CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface JobCardHeaderProps {
  id: string;
  serviceType: string;
  priority: "high" | "medium" | "low";
  status: "scheduled" | "in_progress" | "completed";
}

export const JobCardHeader = ({
  serviceType,
  priority,
  status,
}: JobCardHeaderProps) => {
  return (
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <div className="flex flex-col space-y-1.5">
        <h3 className="font-semibold leading-none tracking-tight">
          {serviceType}
        </h3>
      </div>
      <div className="flex gap-2">
        <Badge variant={priority === "high" ? "destructive" : priority === "medium" ? "default" : "secondary"}>
          {priority}
        </Badge>
        <Badge variant={status === "completed" ? "default" : status === "in_progress" ? "secondary" : "outline"}>
          {status}
        </Badge>
      </div>
    </CardHeader>
  );
};