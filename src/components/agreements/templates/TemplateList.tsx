import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Template {
  id: string;
  name: string;
  description: string;
  agreement_type: "lease_to_own" | "short_term";
  rent_amount: number;
  final_price: number;
  agreement_duration: string;
  daily_late_fee: number;
  is_active: boolean;
}

interface TemplateListProps {
  templates: Template[];
  isLoading: boolean;
}

export const TemplateList = ({ templates, isLoading }: TemplateListProps) => {
  if (isLoading) {
    return <div>Loading templates...</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Rent Amount</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Late Fee</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {templates.map((template) => (
          <TableRow key={template.id}>
            <TableCell className="font-medium">{template.name}</TableCell>
            <TableCell>
              <Badge variant={template.agreement_type === "lease_to_own" ? "default" : "secondary"}>
                {template.agreement_type === "lease_to_own"
                  ? "Lease to Own"
                  : "Short Term"}
              </Badge>
            </TableCell>
            <TableCell>{template.rent_amount} QAR</TableCell>
            <TableCell>{template.agreement_duration}</TableCell>
            <TableCell>{template.daily_late_fee} QAR/day</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
        {templates.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} className="text-center">
              No templates found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};