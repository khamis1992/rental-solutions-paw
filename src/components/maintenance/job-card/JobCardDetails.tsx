import { CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Wrench, User, Car, Package, DollarSign, FileText, Clipboard } from "lucide-react";

interface Part {
  name: string;
  partNumber: string;
  quantity: number;
  status: "in_stock" | "out_of_stock" | "on_order";
  cost: number;
  supplier?: string;
}

interface JobCardDetailsProps {
  vehicleInfo?: {
    make: string;
    model: string;
    year: number;
    licensePlate: string;
  };
  scheduledDate: string;
  dueDate?: string;
  assignedTo?: string;
  estimatedHours?: number;
  description: string;
  parts?: Part[];
  totalPartsCost: number;
  totalLaborCost: number;
  totalCost: number;
  vehicleCondition?: string;
  diagnosedIssues?: string[];
  technicianNotes?: string;
}

export const JobCardDetails = ({
  vehicleInfo,
  scheduledDate,
  dueDate,
  assignedTo,
  estimatedHours,
  description,
  parts,
  totalPartsCost,
  totalLaborCost,
  totalCost,
  vehicleCondition,
  diagnosedIssues,
  technicianNotes,
}: JobCardDetailsProps) => {
  return (
    <CardContent>
      <div className="space-y-4">
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
  );
};
