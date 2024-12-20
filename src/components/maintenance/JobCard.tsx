import { Card } from "@/components/ui/card";
import { JobCardHeader } from "./job-card/JobCardHeader";
import { JobCardDetails } from "./job-card/JobCardDetails";
import { JobCardActions } from "./job-card/JobCardActions";

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
  parts?: {
    name: string;
    partNumber: string;
    quantity: number;
    status: "in_stock" | "out_of_stock" | "on_order";
    cost: number;
    supplier?: string;
  }[];
  vehicleCondition?: string;
  diagnosedIssues?: string[];
  technicianNotes?: string;
}

export const JobCard = ({
  id,
  serviceType,
  priority,
  status,
  vehicleInfo,
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
    <Card className="w-full hover:shadow-lg transition-shadow duration-200">
      <JobCardHeader
        id={id}
        serviceType={serviceType}
        priority={priority}
        status={status}
      />
      <JobCardDetails
        vehicleInfo={vehicleInfo}
        scheduledDate={scheduledDate}
        dueDate={dueDate}
        assignedTo={assignedTo}
        estimatedHours={estimatedHours}
        description={description}
        parts={parts}
        totalPartsCost={totalPartsCost}
        totalLaborCost={totalLaborCost}
        totalCost={totalCost}
        vehicleCondition={vehicleCondition}
        diagnosedIssues={diagnosedIssues}
        technicianNotes={technicianNotes}
      />
      <JobCardActions id={id} />
    </Card>
  );
};