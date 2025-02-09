
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface AgreementFiltersProps {
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onSortChange: (value: string) => void;
  searchValue: string;
}

export const AgreementFilters = ({
  onSearchChange,
  onStatusChange,
  onSortChange,
  searchValue,
}: AgreementFiltersProps) => {
  const isMobile = useIsMobile();

  return (
    <div className={cn(
      "flex gap-4",
      isMobile ? "flex-col w-full" : "flex-row items-center"
    )}>
      <div className={cn(
        "relative",
        isMobile ? "w-full" : "w-1/3"
      )}>
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
        <Input
          placeholder="Search agreements..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className={cn(
            "w-full pl-10 bg-white/50 hover:bg-white/80 transition-colors",
            "h-12 text-base", // Increased height for better touch targets
            "focus:ring-2 focus:ring-primary/20 focus:outline-none"
          )}
        />
      </div>

      <div className={cn(
        isMobile ? "w-full" : "w-1/4"
      )}>
        <Select onValueChange={onStatusChange} defaultValue="all">
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
          <SelectContent>
            <SelectItem value="all" className="h-12">All Statuses</SelectItem>
            <SelectItem value="active" className="h-12">Active</SelectItem>
            <SelectItem value="pending" className="h-12">Pending</SelectItem>
            <SelectItem value="completed" className="h-12">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className={cn(
        isMobile ? "w-full" : "w-1/4"
      )}>
        <Select onValueChange={onSortChange} defaultValue="newest">
          <SelectTrigger className={cn(
            "w-full bg-white/50 hover:bg-white/80 transition-colors",
            "h-12 text-base", // Increased height for better touch targets
            "border border-input"
          )}>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest" className="h-12">Newest First</SelectItem>
            <SelectItem value="oldest" className="h-12">Oldest First</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
