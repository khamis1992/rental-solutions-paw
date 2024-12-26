import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";

interface TransactionPreviewTableProps {
  data: any[];
  onDataChange: (data: any[]) => void;
}

export const TransactionPreviewTable = ({ 
  data,
  onDataChange
}: TransactionPreviewTableProps) => {
  const [selectedCustomers, setSelectedCustomers] = useState<Record<number, string>>({});

  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'customer');
      
      if (error) throw error;
      return data;
    }
  });

  const { data: categories } = useQuery({
    queryKey: ['accounting-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('accounting_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  const handleCustomerChange = (index: number, customerId: string) => {
    const newSelectedCustomers = { ...selectedCustomers, [index]: customerId };
    setSelectedCustomers(newSelectedCustomers);
    
    const newData = data.map((item, idx) => {
      if (idx === index) {
        return { ...item, customer_id: customerId };
      }
      return item;
    });
    
    onDataChange(newData);
  };

  const handleCategoryChange = (index: number, categoryId: string) => {
    const newData = data.map((item, idx) => {
      if (idx === index) {
        return { ...item, category_id: categoryId };
      }
      return item;
    });
    
    onDataChange(newData);
  };

  const formatTransactionDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString;
      }
      return format(date, 'dd/MM/yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer Name</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>License Plate</TableHead>
            <TableHead>Vehicle</TableHead>
            <TableHead>Payment Date</TableHead>
            <TableHead>Payment Method</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment Number</TableHead>
            <TableHead>Payment Description</TableHead>
            <TableHead>Category</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={index}>
              <TableCell>
                <Select
                  value={selectedCustomers[index] || 'unassigned'}
                  onValueChange={(value) => handleCustomerChange(index, value)}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {customers?.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>{formatCurrency(row.amount)}</TableCell>
              <TableCell>{row.license_plate || '-'}</TableCell>
              <TableCell>{row.vehicle || '-'}</TableCell>
              <TableCell>{formatTransactionDate(row.payment_date)}</TableCell>
              <TableCell>{row.payment_method || '-'}</TableCell>
              <TableCell>{row.status || 'Pending'}</TableCell>
              <TableCell>{row.payment_number || '-'}</TableCell>
              <TableCell>{row.payment_description || '-'}</TableCell>
              <TableCell>
                <Select
                  value={row.category_id || 'uncategorized'}
                  onValueChange={(value) => handleCategoryChange(index, value)}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="uncategorized">Uncategorized</SelectItem>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};