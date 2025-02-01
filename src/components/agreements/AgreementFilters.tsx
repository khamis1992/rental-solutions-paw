import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface AgreementFiltersProps {
  onStatusChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onSearch: (value: string) => void;
  searchValue: string;
}

export const AgreementFilters = ({
  onStatusChange,
  onSortChange,
  onSearch,
  searchValue,
}: AgreementFiltersProps) => {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center mb-6">
      <div className="relative w-full md:w-96">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search agreements by number, customer, or vehicle..."
          value={searchValue}
          onChange={(e) => onSearch(e.target.value)}
          className="pl-8"
        />
      </div>
    </div>
  );
};