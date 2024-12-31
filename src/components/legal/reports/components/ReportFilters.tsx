import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Minus } from "lucide-react";

interface ReportFilter {
  field: string;
  operator: string;
  value: string;
}

interface ReportFiltersProps {
  availableFields: Array<{
    name: string;
    label: string;
    type: string;
  }>;
  filters: ReportFilter[];
  onAddFilter: () => void;
  onRemoveFilter: (index: number) => void;
  onFilterChange: (index: number, key: keyof ReportFilter, value: string) => void;
}

export const ReportFilters = ({
  availableFields,
  filters,
  onAddFilter,
  onRemoveFilter,
  onFilterChange,
}: ReportFiltersProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium">Filters</label>
        <Button variant="outline" size="sm" onClick={onAddFilter}>
          <Plus className="h-4 w-4 mr-2" />
          Add Filter
        </Button>
      </div>
      <div className="space-y-2">
        {filters.map((filter, index) => (
          <div key={index} className="flex items-center gap-2">
            <Select
              value={filter.field}
              onValueChange={(value) => onFilterChange(index, 'field', value)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select field" />
              </SelectTrigger>
              <SelectContent>
                {availableFields.map((field) => (
                  <SelectItem key={field.name} value={field.name}>
                    {field.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filter.operator}
              onValueChange={(value) => onFilterChange(index, 'operator', value)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select operator" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="equals">Equals</SelectItem>
                <SelectItem value="contains">Contains</SelectItem>
                <SelectItem value="greater_than">Greater than</SelectItem>
                <SelectItem value="less_than">Less than</SelectItem>
              </SelectContent>
            </Select>
            <Input
              value={filter.value}
              onChange={(e) => onFilterChange(index, 'value', e.target.value)}
              placeholder="Value"
              className="flex-1"
            />
            <Button
              variant="destructive"
              size="icon"
              onClick={() => onRemoveFilter(index)}
            >
              <Minus className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};