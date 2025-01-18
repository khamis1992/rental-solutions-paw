import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Eye, Trash } from "lucide-react";
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
  template_structure: Record<string, any>;
  template_sections: any[];
  variable_mappings: Record<string, any>;
}

interface TemplateListProps {
  templates: Template[];
  isLoading: boolean;
  onPreview?: (template: Template) => void;
  onEdit?: (template: Template) => void;
  onDelete?: (template: Template) => void;
}

export const TemplateList = ({ 
  templates, 
  isLoading,
  onPreview,
  onEdit,
  onDelete 
}: TemplateListProps) => {
  if (isLoading) {
    return <div>Loading templates...</div>;
  }

  const getVariableCount = (template: Template) => {
    const mappings = template.variable_mappings || {};
    return Object.values(mappings).reduce((count, section) => 
      count + Object.keys(section as object).length, 0
    );
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Variables</TableHead>
          <TableHead>Sections</TableHead>
          <TableHead>Base Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {templates.map((template) => (
          <TableRow key={template.id}>
            <TableCell className="font-medium">
              {template.name}
              {template.description && (
                <p className="text-sm text-muted-foreground">{template.description}</p>
              )}
            </TableCell>
            <TableCell>
              <Badge variant={template.agreement_type === "lease_to_own" ? "default" : "secondary"}>
                {template.agreement_type === "lease_to_own" ? "Lease to Own" : "Short Term"}
              </Badge>
            </TableCell>
            <TableCell>{getVariableCount(template)} variables</TableCell>
            <TableCell>{(template.template_sections || []).length} sections</TableCell>
            <TableCell>{template.rent_amount} QAR</TableCell>
            <TableCell>
              <Badge variant={template.is_active ? "success" : "secondary"}>
                {template.is_active ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => onPreview?.(template)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => onEdit?.(template)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => onDelete?.(template)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
        {templates.length === 0 && (
          <TableRow>
            <TableCell colSpan={7} className="text-center">
              No templates found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};