import React, { useCallback } from 'react';
import { OptimizedDataList } from './OptimizedDataList';
import { toast } from "sonner";

export const OptimizedDataListDemo = () => {
  // Example data
  const items = React.useMemo(() => [
    { id: '1', title: 'Item 1', description: 'Description 1' },
    { id: '2', title: 'Item 2', description: 'Description 2' },
    // ... more items
  ], []);

  // Callbacks are defined at component level and memoized
  const handleItemSelect = useCallback((item: { id: string; title: string }) => {
    toast.success(`Selected item: ${item.title}`);
  }, []);

  const handleRefresh = useCallback(() => {
    toast.info('Refreshing data...');
    // Add your refresh logic here
  }, []);

  return (
    <OptimizedDataList
      items={items}
      onItemSelect={handleItemSelect}
      onRefresh={handleRefresh}
    />
  );
};