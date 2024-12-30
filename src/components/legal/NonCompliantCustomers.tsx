import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Printer, FileText, Filter } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { format, subDays } from "date-fns";
import { LegalDocumentDialog } from "./LegalDocumentDialog";

interface NonCompliantCustomer {
  id: string;
  full_name: string | null;
  phone_number: string | null;
  leases: {
    id: string;
    payment_schedules: {
      id: string;
      due_date: string;
      amount: number;
      status: string;
    }[];
  }[];
}

export function NonCompliantCustomers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);

  const { data: nonCompliantCustomers, isLoading } = useQuery({
    queryKey: ["non-compliant-customers"],
    queryFn: async () => {
      const { data: customers, error } = await supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          phone_number,
          leases (
            id,
            payment_schedules (
              id,
              due_date,
              amount,
              status
            )
          )
        `)
        .eq("role", "customer");

      if (error) throw error;

      return customers.filter((customer: NonCompliantCustomer) => {
        const hasOverduePayments = customer.leases?.some(lease =>
          lease.payment_schedules?.some(payment =>
            payment.status === 'pending' && new Date(payment.due_date) < new Date()
          )
        );

        return hasOverduePayments;
      }) as NonCompliantCustomer[];
    },
  });

  const calculateOverdueAmount = (customer: NonCompliantCustomer) => {
    let totalOverdue = 0;
    customer.leases?.forEach(lease => {
      lease.payment_schedules?.forEach(payment => {
        if (payment.status === 'pending' && new Date(payment.due_date) < new Date()) {
          totalOverdue += payment.amount;
        }
      });
    });
    return totalOverdue;
  };

  const filteredCustomers = nonCompliantCustomers?.filter(customer =>
    customer.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-[300px]"
            />
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print List
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer Name</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead>Overdue Payments</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers?.map((customer) => {
                const overdueAmount = calculateOverdueAmount(customer);

                return (
                  <TableRow key={customer.id}>
                    <TableCell>{customer.full_name}</TableCell>
                    <TableCell>{customer.phone_number}</TableCell>
                    <TableCell>
                      <Badge variant="destructive">
                        {formatCurrency(overdueAmount)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedCustomer(customer.id)}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Generate Document
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {!isLoading && (!filteredCustomers || filteredCustomers.length === 0) && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    No non-compliant customers found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <LegalDocumentDialog
        customerId={selectedCustomer}
        open={!!selectedCustomer}
        onOpenChange={(open) => !open && setSelectedCustomer(null)}
      />
    </div>
  );
}