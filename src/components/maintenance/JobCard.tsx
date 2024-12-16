import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  Calendar,
  Clock,
  Wrench,
  User,
  Car,
  Tool,
  Package,
  DollarSign,
  FileText,
  Tag,
  Clipboard,
} from "lucide-react";

interface Part {
  name: string;
  partNumber: string;
  quantity: number;
  status: "in_stock" | "out_of_stock" | "on_order";
  cost: number;
  supplier?: string;
}

interface JobCardProps {
  id: string;
  vehicleId: string;
  vehicleInfo?: {
    make: string;
    model: string;
    year: number;
    licensePlate: string;
  };
  serviceType: string;
  category: "routine" | "emergency" | "preventive";
  priority: "high" | "medium" | "low";
  status: "scheduled" | "in_progress" | "completed";
  scheduledDate: string;
  dueDate?: string;
  description: string;
  assignedTo?: string;
  estimatedHours?: number;
  laborRate?: number;
  parts?: Part[];
  vehicleCondition?: string;
  diagnosedIssues?: string[];
  technicianNotes?: string;
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

const categoryColors = {
  routine: "bg-blue-100 text-blue-800",
  emergency: "bg-red-100 text-red-800",
  preventive: "bg-green-100 text-green-800",
};

export const JobCard = ({
  id,
  vehicleId,
  vehicleInfo,
  serviceType,
  category,
  priority,
  status,
  scheduledDate,
  dueDate,
  description,
  assignedTo,
  estimatedHours,
  laborRate,
  parts,
  vehicleCondition,
  diagnosedIssues,
  technicianNotes,
}: JobCardProps) => {
  const totalPartsCost = parts?.reduce((sum, part) => sum + part.cost * part.quantity, 0) || 0;
  const totalLaborCost = (estimatedHours || 0) * (laborRate || 0);
  const totalCost = totalPartsCost + totalLaborCost;

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Job ID: {id}</div>
            <CardTitle className="text-lg font-semibold">{serviceType}</CardTitle>
          </div>
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
          {/* Vehicle Information */}
          {vehicleInfo && (
            <div className="space-y-2">
              <div className="flex items-center text-sm font-medium">
                <Car className="w-4 h-4 mr-2" />
                Vehicle Details
              </div>
              <div className="pl-6 space-y-1 text-sm text-muted-foreground">
                <div>{`${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model}`}</div>
                <div>License: {vehicleInfo.licensePlate}</div>
              </div>
            </div>
          )}

          {/* Scheduling Information */}
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 mr-2" />
                {new Date(scheduledDate).toLocaleDateString()}
              </div>
              {dueDate && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 mr-2" />
                  Due: {new Date(dueDate).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>

          {/* Assignment and Time */}
          <div className="space-y-2">
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
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="flex items-start text-sm">
              <Wrench className="w-4 h-4 mr-2 mt-1" />
              <p className="text-muted-foreground">{description}</p>
            </div>
          </div>

          {/* Parts Information */}
          {parts && parts.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center text-sm font-medium">
                <Package className="w-4 h-4 mr-2" />
                Parts Required
              </div>
              <div className="pl-6 space-y-2">
                {parts.map((part, index) => (
                  <div key={index} className="text-sm text-muted-foreground flex justify-between">
                    <span>{part.name} (x{part.quantity})</span>
                    <Badge variant="outline" className="ml-2">
                      {part.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Costs */}
          {(totalPartsCost > 0 || totalLaborCost > 0) && (
            <div className="space-y-2">
              <div className="flex items-center text-sm font-medium">
                <DollarSign className="w-4 h-4 mr-2" />
                Cost Breakdown
              </div>
              <div className="pl-6 space-y-1 text-sm text-muted-foreground">
                {totalPartsCost > 0 && <div>Parts: ${totalPartsCost.toFixed(2)}</div>}
                {totalLaborCost > 0 && <div>Labor: ${totalLaborCost.toFixed(2)}</div>}
                <div className="font-medium">Total: ${totalCost.toFixed(2)}</div>
              </div>
            </div>
          )}

          {/* Vehicle Condition and Issues */}
          {(vehicleCondition || (diagnosedIssues && diagnosedIssues.length > 0)) && (
            <div className="space-y-2">
              <div className="flex items-center text-sm font-medium">
                <Clipboard className="w-4 h-4 mr-2" />
                Vehicle Condition
              </div>
              <div className="pl-6 space-y-2 text-sm text-muted-foreground">
                {vehicleCondition && <div>{vehicleCondition}</div>}
                {diagnosedIssues && diagnosedIssues.length > 0 && (
                  <div className="space-y-1">
                    <div className="font-medium">Diagnosed Issues:</div>
                    <ul className="list-disc pl-4">
                      {diagnosedIssues.map((issue, index) => (
                        <li key={index}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Technician Notes */}
          {technicianNotes && (
            <div className="space-y-2">
              <div className="flex items-center text-sm font-medium">
                <FileText className="w-4 h-4 mr-2" />
                Technician Notes
              </div>
              <div className="pl-6 text-sm text-muted-foreground">
                {technicianNotes}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};