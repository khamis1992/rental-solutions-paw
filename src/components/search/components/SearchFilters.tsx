import { type SearchFiltersProps, type SearchFilters } from '../types/search.types';

export const SearchFilters = ({ onFilterChange, filters }: SearchFiltersProps) => {
  const handleDateRangeChange = (dateRange: { from: Date; to: Date } | null) => {
    onFilterChange({ ...filters, dateRange });
  };

  const handleStatusChange = (status: string[]) => {
    onFilterChange({ ...filters, status });
  };

  const handleTypeChange = (type: string[]) => {
    onFilterChange({ ...filters, type });
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Date Range Filter */}
      <div>
        <label>Date Range</label>
        <input
          type="date"
          onChange={(e) => handleDateRangeChange({ from: new Date(e.target.value), to: filters.dateRange?.to || null })}
        />
        <input
          type="date"
          onChange={(e) => handleDateRangeChange({ from: filters.dateRange?.from || null, to: new Date(e.target.value) })}
        />
      </div>

      {/* Status Filter */}
      <div>
        <label>Status</label>
        <select multiple onChange={(e) => handleStatusChange(Array.from(e.target.selectedOptions, option => option.value))}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Type Filter */}
      <div>
        <label>Type</label>
        <select multiple onChange={(e) => handleTypeChange(Array.from(e.target.selectedOptions, option => option.value))}>
          <option value="type1">Type 1</option>
          <option value="type2">Type 2</option>
          <option value="type3">Type 3</option>
        </select>
      </div>
    </div>
  );
};
