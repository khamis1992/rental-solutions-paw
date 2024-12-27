import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface EnhancedSelectProps {
  options: Array<{
    value: string;
    label: string;
    description?: string;
  }>;
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  loading?: boolean;
  createNew?: {
    label: string;
    onClick: () => void;
  };
}

export const EnhancedSelect = ({
  options,
  value,
  onValueChange,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  label,
  error,
  disabled,
  loading,
  createNew,
}: EnhancedSelectProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-2">
      {label && <span className="text-sm font-medium">{label}</span>}
      <Select
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <div className="px-3 py-2">
              <Input
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-2"
              />
            </div>
            {loading ? (
              <SelectItem value="loading" disabled>
                Loading...
              </SelectItem>
            ) : filteredOptions.length === 0 ? (
              <>
                <SelectItem value="no-results" disabled>
                  {searchTerm ? `No results found for "${searchTerm}"` : "No options available"}
                </SelectItem>
                {createNew && (
                  <div className="p-2 text-center">
                    <button
                      type="button"
                      onClick={createNew.onClick}
                      className="text-sm text-blue-500 hover:text-blue-700"
                    >
                      {createNew.label}
                    </button>
                  </div>
                )}
              </>
            ) : (
              filteredOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div>
                    <div>{option.label}</div>
                    {option.description && (
                      <div className="text-xs text-muted-foreground">
                        {option.description}
                      </div>
                    )}
                  </div>
                </SelectItem>
              ))
            )}
          </SelectGroup>
        </SelectContent>
      </Select>
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  );
};