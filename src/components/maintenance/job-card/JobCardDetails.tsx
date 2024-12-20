import { CardContent } from "@/components/ui/card";
import { format } from "date-fns";

interface JobCardDetailsProps {
  vehicleInfo?: {
    make: string;
    model: string;
    year: number;
    licensePlate: string;
  };
  scheduledDate: string;
  dueDate?: string;
  description: string;
  assignedTo?: string;
  estimatedHours?: number;
  parts?: {
    name: string;
    partNumber: string;
    quantity: number;
    status: "in_stock" | "out_of_stock" | "on_order";
    cost: number;
    supplier?: string;
  }[];
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
  description,
  assignedTo,
  estimatedHours,
  totalPartsCost,
  totalLaborCost,
  totalCost,
}: JobCardDetailsProps) => {
  return (
    <CardContent className="grid gap-4">
      {vehicleInfo && (
        <div className="flex flex-col space-y-1">
          <p className="text-sm font-medium">Vehicle Information</p>
          <p className="text-sm text-muted-foreground">
            {vehicleInfo.year} {vehicleInfo.make} {vehicleInfo.model} - {vehicleInfo.licensePlate}
          </p>
        </div>
      )}
      <div className="flex flex-col space-y-1">
        <p className="text-sm font-medium">Scheduled Date</p>
        <p className="text-sm text-muted-foreground">
          {format(new Date(scheduledDate), 'PPP')}
        </p>
      </div>
      <div className="flex flex-col space-y-1">
        <p className="text-sm font-medium">Description</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {assignedTo && (
        <div className="flex flex-col space-y-1">
          <p className="text-sm font-medium">Assigned To</p>
          <p className="text-sm text-muted-foreground">{assignedTo}</p>
        </div>
      )}
      <div className="flex flex-col space-y-1">
        <p className="text-sm font-medium">Cost Breakdown</p>
        <div className="text-sm text-muted-foreground space-y-1">
          {estimatedHours && <p>Labor ({estimatedHours} hours): ${totalLaborCost}</p>}
          <p>Parts: ${totalPartsCost}</p>
          <p className="font-medium">Total: ${totalCost}</p>
        </div>
      </div>
    </CardContent>
  );
};