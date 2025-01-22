import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Package, Plus, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { CreatePartDialog } from './CreatePartDialog';

interface PartInventory {
  id: string;
  part_name: string;
  part_number: string;
  quantity_in_stock: number;
  minimum_stock_level: number;
  reorder_point: number;
  unit_cost: number;
  location: string;
  status: string;
}

export const PartsInventory = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: parts, isLoading, refetch } = useQuery({
    queryKey: ['parts-inventory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('parts_inventory')
        .select('*')
        .order('part_name');

      if (error) {
        toast.error('Failed to fetch parts inventory');
        throw error;
      }

      return data as PartInventory[];
    },
  });

  const handleRefresh = () => {
    refetch();
    toast.success('Inventory refreshed');
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Package className="h-6 w-6 text-primary" />
              <CardTitle>Parts Inventory</CardTitle>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Part
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading inventory...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Part Name</TableHead>
                  <TableHead>Part Number</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Reorder Point</TableHead>
                  <TableHead>Unit Cost (QAR)</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parts?.map((part) => (
                  <TableRow key={part.id}>
                    <TableCell>{part.part_name}</TableCell>
                    <TableCell>{part.part_number}</TableCell>
                    <TableCell className={part.quantity_in_stock <= part.minimum_stock_level ? 'text-red-500 font-medium' : ''}>
                      {part.quantity_in_stock}
                    </TableCell>
                    <TableCell>{part.reorder_point}</TableCell>
                    <TableCell>{part.unit_cost.toFixed(2)}</TableCell>
                    <TableCell>{part.location}</TableCell>
                    <TableCell>{part.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CreatePartDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={() => {
          refetch();
          setIsCreateDialogOpen(false);
        }}
      />
    </div>
  );
};