import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Package2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface PartsOrder {
  id: string;
  supplier_id: string;
  order_date: string;
  status: string;
  total_amount: number;
  expected_delivery_date: string | null;
  notes: string | null;
  supplier: {
    supplier_name: string;
  };
  parts_order_items: {
    part_id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    part: {
      part_name: string;
    };
  }[];
}

export const PartsOrderList = () => {
  const { data: orders, isLoading, refetch } = useQuery({
    queryKey: ['parts-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('parts_orders')
        .select(`
          *,
          supplier:parts_suppliers(supplier_name),
          parts_order_items(
            part_id,
            quantity,
            unit_price,
            total_price,
            part:parts_inventory(part_name)
          )
        `)
        .order('order_date', { ascending: false });

      if (error) {
        toast.error('Failed to fetch orders');
        throw error;
      }

      return data as PartsOrder[];
    },
  });

  const handleRefresh = () => {
    refetch();
    toast.success('Orders refreshed');
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'text-yellow-500';
      case 'processing':
        return 'text-blue-500';
      case 'shipped':
        return 'text-purple-500';
      case 'delivered':
        return 'text-green-500';
      case 'cancelled':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Package2 className="h-6 w-6 text-primary" />
            <CardTitle>Parts Orders</CardTitle>
          </div>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">Loading orders...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order Date</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total Amount (QAR)</TableHead>
                <TableHead>Expected Delivery</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders?.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{format(new Date(order.order_date), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{order.supplier.supplier_name}</TableCell>
                  <TableCell>
                    <ul className="list-disc list-inside">
                      {order.parts_order_items.map((item, index) => (
                        <li key={index}>
                          {item.part.part_name} (x{item.quantity})
                        </li>
                      ))}
                    </ul>
                  </TableCell>
                  <TableCell>{order.total_amount.toFixed(2)}</TableCell>
                  <TableCell>
                    {order.expected_delivery_date
                      ? format(new Date(order.expected_delivery_date), 'dd/MM/yyyy')
                      : 'Not set'}
                  </TableCell>
                  <TableCell>
                    <span className={`font-medium ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};