import { Button } from "@/components/ui/button";

interface ReportFieldsProps {
  availableFields: Array<{
    name: string;
    label: string;
    type: string;
  }>;
  selectedFields: string[];
  onFieldToggle: (fieldName: string) => void;
}

export const ReportFields = ({ 
  availableFields, 
  selectedFields, 
  onFieldToggle 
}: ReportFieldsProps) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">Select Fields</label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {availableFields.map((field) => (
          <Button
            key={field.name}
            variant={selectedFields.includes(field.name) ? "default" : "outline"}
            onClick={() => onFieldToggle(field.name)}
            className="justify-start"
          >
            {field.label}
          </Button>
        ))}
      </div>
    </div>
  );
};