
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, UserCheck, Clock, UserX, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

export interface CustomerFiltersProps {
  onSearchChange: (value: string) => void;
  onRoleFilter: (value: string) => void;
}

export const CustomerFilters = ({
  onSearchChange,
  onRoleFilter,
}: CustomerFiltersProps) => {
  const isMobile = useIsMobile();

  return (
    <div className={cn(
      "flex gap-4",
      isMobile ? "flex-col" : "flex-row items-center"
    )}>
      <div className={cn(
        "relative",
        isMobile ? "w-full" : "w-1/3"
      )}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search customers..."
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 bg-white/50 hover:bg-white/80 transition-colors"
          />
        </div>
      </div>
      <div className={cn(
        isMobile ? "w-full" : "w-1/4"
      )}>
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
                <Clock className="h-4 w-4 text-amber-500" />
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
