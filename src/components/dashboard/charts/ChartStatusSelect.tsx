import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ChartStatusSelectProps {
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  statusData: Array<{
    name: string;
    value: number;
  }>;
}

export const ChartStatusSelect = ({ 
  selectedStatus, 
  onStatusChange, 
  statusData 
}: ChartStatusSelectProps) => {
  return (
    <Select 
      value={selectedStatus} 
      onValueChange={onStatusChange}
    >
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="All Vehicle Types" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Vehicle Types</SelectItem>
        {statusData?.map((status) => (
          <SelectItem key={status.name} value={status.name.toLowerCase()}>
            {status.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};