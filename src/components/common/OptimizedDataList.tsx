import React, { useCallback, useState, useEffect } from 'react';
import { handleBasicSort, handleBasicFilter, handleError } from '@/utils/callbackUtils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

interface DataItem {
  id: string;
  title: string;
  description: string;
}

interface OptimizedDataListProps {
  items: DataItem[];
  onItemSelect?: (item: DataItem) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export const OptimizedDataList = ({ 
  items, 
  onItemSelect, 
  onRefresh,
  isLoading 
}: OptimizedDataListProps) => {
  const [sortField, setSortField] = useState<string>('');
  const [filterText, setFilterText] = useState<string>('');

  // Memoize sort handler with useCallback since it depends on sortField
  const handleSort = useCallback((field: string) => {
    handleBasicSort(field, sortField, setSortField);
  }, [sortField]);

  // Memoize filter handler
  const handleFilter = useCallback((value: string) => {
    handleBasicFilter(value, setFilterText);
  }, []);

  // Memoize item selection handler if provided
  const handleItemSelect = useCallback((item: DataItem) => {
    try {
      onItemSelect?.(item);
    } catch (error) {
      handleError(error as Error, 'OptimizedDataList.handleItemSelect');
    }
  }, [onItemSelect]);

  // Memoize refresh handler if provided
  const handleRefresh = useCallback(() => {
    try {
      onRefresh?.();
    } catch (error) {
      handleError(error as Error, 'OptimizedDataList.handleRefresh');
    }
  }, [onRefresh]);

  // skipcq: JS-0323
  // Effect is used for debugging re-renders
  useEffect(() => {
    console.debug('OptimizedDataList rendered with:', {
      itemCount: items.length,
      sortField,
      filterText
    });
  });

  const filteredItems = React.useMemo(() => {
    return items.filter(item => 
      item.title.toLowerCase().includes(filterText.toLowerCase()) ||
      item.description.toLowerCase().includes(filterText.toLowerCase())
    );
  }, [items, filterText]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          type="text"
          placeholder="Filter items..."
          onChange={(e) => handleFilter(e.target.value)}
          className="max-w-sm"
        />
        <Button
          onClick={handleRefresh}
          disabled={isLoading}
        >
          Refresh
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <button 
                onClick={() => handleSort('title')}
                className="font-medium text-left"
              >
                Title
              </button>
            </TableHead>
            <TableHead>Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredItems.map((item) => (
            <TableRow 
              key={item.id}
              onClick={() => handleItemSelect(item)}
              className="cursor-pointer hover:bg-muted/50"
            >
              <TableCell>{item.title}</TableCell>
              <TableCell>{item.description}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};