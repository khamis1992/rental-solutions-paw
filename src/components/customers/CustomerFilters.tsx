import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

export interface CustomerFiltersProps {
  onSearchChange: (value: string) => void;
  onRoleFilter: (value: string) => void;
}

export const CustomerFilters = ({
  onSearchChange,
  onRoleFilter,
}: CustomerFiltersProps) => {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center">
      <div className="w-full md:w-1/3 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search customers..."
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10"
        />
      </div>
      <div className="w-full md:w-1/4">
        <Select onValueChange={onRoleFilter} defaultValue="all">
          <SelectTrigger className="w-full">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Filter by role" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="customer">Customer</SelectItem>
            <SelectItem value="staff">Staff</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};