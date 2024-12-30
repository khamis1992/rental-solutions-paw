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

export function NonCompliantCustomers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);

  const { data: nonCompliantCustomers, isLoading } = useQuery({
    queryKey: ["non-compliant-customers"],
    queryFn: async () => {
      const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
      const tenthOfMonth = new Date();
      tenthOfMonth.setDate(10);

      const { data: customers, error } = await supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          leases (
            id,
            payment_schedules (
              id,
              due_date,
              amount,
              status
            ),
            traffic_fines (
              id,
              violation_date,
              fine_amount,
              payment_status
            ),
            damages (
              id,
              description,
              repair_cost,
              status
            )
          )
        `)
        .eq("role", "customer");

      if (error) throw error;

      return customers.filter(customer => {
        const hasOverduePayments = customer.leases?.some(lease =>
          lease.payment_schedules?.some(payment =>
            payment.status === 'pending' && new Date(payment.due_date) < tenthOfMonth
          )
        );

        const hasUnpaidFines = customer.leases?.some(lease =>
          lease.traffic_fines?.some(fine =>
            fine.payment_status === 'pending' && new Date(fine.violation_date) < new Date(thirtyDaysAgo)
          )
        );

        const hasUnresolvedDamages = customer.leases?.some(lease =>
          lease.damages?.some(damage => damage.status === 'pending')
        );

        return hasOverduePayments || hasUnpaidFines || hasUnresolvedDamages;
      });
    },
  });

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
                <TableHead>Overdue Payments</TableHead>
                <TableHead>Unpaid Fines</TableHead>
                <TableHead>Damages</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers?.map((customer) => {
                const overduePayments = customer.leases?.flatMap(lease => 
                  lease.payment_schedules?.filter(payment => 
                    payment.status === 'pending'
                  ) || []
                );

                const unpaidFines = customer.leases?.flatMap(lease =>
                  lease.traffic_fines?.filter(fine =>
                    fine.payment_status === 'pending'
                  ) || []
                );

                const unresolvedDamages = customer.leases?.flatMap(lease =>
                  lease.damages?.filter(damage =>
                    damage.status === 'pending'
                  ) || []
                );

                const totalOverdue = overduePayments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
                const totalFines = unpaidFines?.reduce((sum, fine) => sum + fine.fine_amount, 0) || 0;
                const totalDamages = unresolvedDamages?.reduce((sum, damage) => sum + (damage.repair_cost || 0), 0) || 0;

                return (
                  <TableRow key={customer.id}>
                    <TableCell>{customer.full_name}</TableCell>
                    <TableCell>
                      <Badge variant="destructive">
                        {formatCurrency(totalOverdue)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="destructive">
                        {formatCurrency(totalFines)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="destructive">
                        {formatCurrency(totalDamages)}
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
                  <TableCell colSpan={5} className="text-center">
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