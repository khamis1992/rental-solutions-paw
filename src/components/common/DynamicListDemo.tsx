import React, { useState } from 'react';
import { DynamicList } from './DynamicList';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface DemoItem {
  id: string;
  title: string;
  description: string;
}

export const DynamicListDemo = () => {
  const [items, setItems] = useState<DemoItem[]>([
    {
      id: 'item-1',
      title: 'First Item',
      description: 'This is the first item description'
    },
    {
      id: 'item-2',
      title: 'Second Item',
      description: 'This is the second item description'
    }
  ]);

  const handleAddItem = () => {
    const newId = `item-${items.length + 1}`;
    setItems(prevItems => [...prevItems, {
      id: newId,
      title: `Item ${items.length + 1}`,
      description: `This is item ${items.length + 1} description`
    }]);
    toast.success('Item added successfully');
  };

  const handleRemoveItem = (id: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
    toast.success('Item removed successfully');
  };

  const handleSort = () => {
    setItems(prevItems => [...prevItems].sort((a, b) => a.title.localeCompare(b.title)));
    toast.success('Items sorted alphabetically');
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button onClick={handleAddItem}>Add Item</Button>
        <Button variant="outline" onClick={handleSort}>Sort Items</Button>
      </div>

      <DynamicList
        items={items.map(item => ({
          id: item.id,
          content: (
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveItem(item.id);
                }}
              >
                Remove
              </Button>
            </div>
          )
        }))}
        onItemClick={(id) => toast.info(`Clicked item ${id}`)}
      />
    </div>
  );
};