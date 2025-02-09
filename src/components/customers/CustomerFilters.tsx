
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, UserCheck, UserClock, UserX, Users } from "lucide-react";
import { cn } from "@/lib/utils";

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
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search customers..."
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 bg-white/50 hover:bg-white/80 transition-colors"
          />
        </div>
      </div>
      <div className="w-full md:w-1/4">
        <Select onValueChange={onRoleFilter} defaultValue="all">
          <SelectTrigger className={cn(
            "w-full bg-white/50 hover:bg-white/80 transition-colors",
            "border border-input"
          )}>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Filter by status" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>All Statuses</span>
              </div>
            </SelectItem>
            <SelectItem value="active">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-emerald-500" />
                <span>Active</span>
              </div>
            </SelectItem>
            <SelectItem value="pending">
              <div className="flex items-center gap-2">
                <UserClock className="h-4 w-4 text-amber-500" />
                <span>Pending</span>
              </div>
            </SelectItem>
            <SelectItem value="inactive">
              <div className="flex items-center gap-2">
                <UserX className="h-4 w-4 text-gray-500" />
                <span>Inactive</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
