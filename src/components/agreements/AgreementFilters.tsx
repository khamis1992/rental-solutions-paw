import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState, useCallback } from "react";
import { debounce } from "lodash";

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
  const [localSearchValue, setLocalSearchValue] = useState(searchValue);

  // Debounce the search to avoid too many requests
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      onSearch(value);
    }, 300),
    [onSearch]
  );

  const handleSearchChange = (value: string) => {
    setLocalSearchValue(value);
    debouncedSearch(value);
  };

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center mb-6">
      <div className="relative w-full md:w-96">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search agreements by number, customer, or vehicle..."
          value={localSearchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-8"
        />
      </div>
    </div>
  );
};