import { CommandSelect } from "@/components/ui/command-select";

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
  const items = [
    { value: "all", label: "All Vehicle Types" },
    ...statusData.map(status => ({
      value: status.name.toLowerCase(),
      label: status.name
    }))
  ];

  return (
    <CommandSelect
      items={items}
      value={selectedStatus}
      onValueChange={onStatusChange}
      placeholder="All Vehicle Types"
      className="w-[200px]"
    />
  );
};