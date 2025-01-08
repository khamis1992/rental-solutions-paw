import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface AgreementFiltersProps {
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onSortChange: (value: string) => void;
}

export const AgreementFilters = ({
  onSearchChange,
  onStatusChange,
  onSortChange,
}: AgreementFiltersProps) => {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center mb-6">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search agreements"
          className="pl-10 w-full"
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search agreements"
          role="searchbox"
        />
      </div>
    </div>
  );
};