import { useState } from "react";
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
import { LegalDocumentDialog } from "./LegalDocumentDialog";
import { useOverduePayments } from "./hooks/useOverduePayments";
import { Loader2 } from "lucide-react";

interface OverduePayment {
  id: string;
  amount: number;
  dueDate: string;
  agreementNumber?: string;
}

interface NonCompliantCustomer {
  customerId: string;
  customerName: string;
  phoneNumber: string;
  totalOverdue: number;
  payments: OverduePayment[];
}

export function NonCompliantCustomers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const { overduePayments, isLoading } = useOverduePayments();

  const filteredCustomers = overduePayments?.filter((customer: NonCompliantCustomer) =>
    customer.customerName.toLowerCase().includes(searchTerm.toLowerCase())
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
                <TableHead>Phone Number</TableHead>
                <TableHead>Overdue Amount</TableHead>
                <TableHead>Number of Overdue Payments</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers?.map((customer: NonCompliantCustomer) => (
                <TableRow key={customer.customerId}>
                  <TableCell>{customer.customerName}</TableCell>
                  <TableCell>{customer.phoneNumber}</TableCell>
                  <TableCell>
                    <Badge variant="destructive">
                      {formatCurrency(customer.totalOverdue)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {customer.payments.length}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCustomer(customer.customerId)}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Document
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && (!filteredCustomers || filteredCustomers.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No customers with overdue payments found
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