import React, { useMemo } from 'react';

interface ListItem {
  id: string;
  content: React.ReactNode;
}

interface DynamicListProps {
  items: ListItem[];
  onItemClick?: (id: string) => void;
  className?: string;
  itemClassName?: string;
}

export const DynamicList = ({ 
  items, 
  onItemClick,
  className = "space-y-2",
  itemClassName = "p-4 rounded-md border hover:bg-muted/50 transition-colors"
}: DynamicListProps) => {
  // Memoize the list to prevent unnecessary re-renders
  const memoizedItems = useMemo(() => items, [items]);

  return (
    <ul className={className} role="list">
      {memoizedItems.map((item) => (
        <li
          key={item.id}
          className={itemClassName}
          onClick={() => onItemClick?.(item.id)}
          role="listitem"
        >
          {item.content}
        </li>
      ))}
    </ul>
  );
};