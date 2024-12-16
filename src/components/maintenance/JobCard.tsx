import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Calendar, Clock, Tool, User } from "lucide-react";

interface JobCardProps {
  id: string;
  vehicleId: string;
  serviceType: string;
  priority: "high" | "medium" | "low";
  status: "scheduled" | "in_progress" | "completed";
  scheduledDate: string;
  description: string;
  assignedTo?: string;
  estimatedHours?: number;
}

const priorityColors = {
  high: "text-red-500 bg-red-100",
  medium: "text-yellow-500 bg-yellow-100",
  low: "text-green-500 bg-green-100",
};

const statusColors = {
  scheduled: "bg-blue-100 text-blue-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
};

export const JobCard = ({
  serviceType,
  priority,
  status,
  scheduledDate,
  description,
  assignedTo,
  estimatedHours,
}: JobCardProps) => {
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">{serviceType}</CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline" className={priorityColors[priority]}>
              <AlertCircle className="w-3 h-3 mr-1" />
              {priority}
            </Badge>
            <Badge className={statusColors[status]}>{status}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 mr-2" />
            {new Date(scheduledDate).toLocaleDateString()}
          </div>
          {assignedTo && (
            <div className="flex items-center text-sm text-muted-foreground">
              <User className="w-4 h-4 mr-2" />
              {assignedTo}
            </div>
          )}
          {estimatedHours && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="w-4 h-4 mr-2" />
              {estimatedHours} hours
            </div>
          )}
          <div className="flex items-start text-sm">
            <Tool className="w-4 h-4 mr-2 mt-1" />
            <p className="text-muted-foreground">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};