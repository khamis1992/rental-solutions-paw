
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
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            placeholder="Search customers..."
            onChange={(e) => onSearchChange(e.target.value)}
            className={cn(
              "w-full pl-10 bg-white/50 hover:bg-white/80 transition-colors",
              "h-12 text-base", // Increased height for better touch targets
              "focus:ring-2 focus:ring-primary/20 focus:outline-none"
            )}
          />
        </div>
      </div>
      <div className={cn(
        isMobile ? "w-full" : "w-1/4"
      )}>
        <Select onValueChange={onRoleFilter} defaultValue="all">
          <SelectTrigger className={cn(
            "w-full bg-white/50 hover:bg-white/80 transition-colors",
            "h-12 text-base", // Increased height for better touch targets
            "border border-input"
          )}>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <SelectValue placeholder="Filter by status" />
            </div>
          </SelectTrigger>
          <SelectContent className="min-w-[200px]">
            <SelectItem value="all" className="h-12"> {/* Increased height */}
              <div className="flex items-center gap-2.5">
                <Users className="h-5 w-5" />
                <span>All Statuses</span>
              </div>
            </SelectItem>
            <SelectItem value="active" className="h-12">
              <div className="flex items-center gap-2.5">
                <UserCheck className="h-5 w-5 text-emerald-500" />
                <span>Active</span>
              </div>
            </SelectItem>
            <SelectItem value="pending" className="h-12">
              <div className="flex items-center gap-2.5">
                <Clock className="h-5 w-5 text-amber-500" />
                <span>Pending</span>
              </div>
            </SelectItem>
            <SelectItem value="inactive" className="h-12">
              <div className="flex items-center gap-2.5">
                <UserX className="h-5 w-5 text-gray-500" />
                <span>Inactive</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
