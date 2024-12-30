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
import { Printer, FileText, Filter, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { format, differenceInDays } from "date-fns";
import { LegalDocumentDialog } from "./LegalDocumentDialog";

export function NonCompliantCustomers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);

  const { data: overduePayments, isLoading } = useQuery({
    queryKey: ["overdue-payments"],
    queryFn: async () => {
      const { data: payments, error } = await supabase
        .from("payment_schedules")
        .select(`
          id,
          due_date,
          amount,
          status,
          lease:leases (
            id,
            agreement_number,
            customer:profiles (
              id,
              full_name,
              email,
              phone_number
            )
          )
        `)
        .eq("status", "pending")
        .lt("due_date", new Date().toISOString())
        .order("due_date");

      if (error) throw error;
      return payments;
    },
  });

  const filteredPayments = overduePayments?.filter(payment =>
    payment.lease?.customer?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
                <TableHead>Agreement Number</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Days Overdue</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Late Fees</TableHead>
                <TableHead>Total Due</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments?.map((payment) => {
                const daysOverdue = differenceInDays(
                  new Date(),
                  new Date(payment.due_date)
                );
                const lateFees = Math.max(0, daysOverdue) * 120; // 120 QAR daily late fee
                const totalDue = payment.amount + lateFees;

                return (
                  <TableRow key={payment.id}>
                    <TableCell>{payment.lease?.customer?.full_name}</TableCell>
                    <TableCell>{payment.lease?.agreement_number}</TableCell>
                    <TableCell>
                      {format(new Date(payment.due_date), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Badge variant="destructive">
                        {daysOverdue} days
                      </Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(payment.amount)}</TableCell>
                    <TableCell>{formatCurrency(lateFees)}</TableCell>
                    <TableCell>
                      <Badge variant="destructive">
                        {formatCurrency(totalDue)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedCustomer(payment.lease?.customer?.id)}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Generate Notice
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {!isLoading && (!filteredPayments || filteredPayments.length === 0) && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    No overdue payments found
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