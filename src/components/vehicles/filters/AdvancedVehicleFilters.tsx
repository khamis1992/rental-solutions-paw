import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

interface AdvancedVehicleFiltersProps {
  searchQuery: string;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

export const AdvancedVehicleFilters = ({
  searchQuery,
  statusFilter,
  onSearchChange,
  onStatusChange,
}: AdvancedVehicleFiltersProps) => {
  const [statuses, setStatuses] = useState<any[]>([]);

  useEffect(() => {
    const fetchStatuses = async () => {
      const { data, error } = await supabase
        .from("vehicle_statuses")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (!error && data) {
        setStatuses(data);
      }
    };

    fetchStatuses();
  }, []);

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end">
      <div className="flex-1">
        <Label htmlFor="search">Search</Label>
        <Input
          id="search"
          placeholder="Search by make, model, or license plate..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full"
        />
      </div>
      <div className="w-full md:w-[200px]">
        <Label htmlFor="status">Vehicle Status</Label>
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger id="status">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {statuses.map((status) => (
              <SelectItem key={status.id} value={status.name}>
                {status.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};