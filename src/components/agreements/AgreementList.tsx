import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, FileText } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const agreements = [
  {
    id: "AGR-001",
    customer: "John Doe",
    vehicle: "2024 Toyota Camry",
    startDate: "2024-03-15",
    endDate: "2024-03-20",
    status: "active",
    amount: 450.00,
  },
  {
    id: "AGR-002",
    customer: "Jane Smith",
    vehicle: "2023 Honda CR-V",
    startDate: "2024-03-18",
    endDate: "2024-03-25",
    status: "pending",
    amount: 680.00,
  },
  {
    id: "AGR-003",
    customer: "Mike Johnson",
    vehicle: "2024 BMW X5",
    startDate: "2024-03-10",
    endDate: "2024-03-17",
    status: "expired",
    amount: 890.00,
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
    case "pending":
      return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20";
    case "expired":
      return "bg-red-500/10 text-red-500 hover:bg-red-500/20";
    default:
      return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20";
  }
};

export const AgreementList = () => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Agreement ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Vehicle</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {agreements.map((agreement) => (
            <TableRow key={agreement.id}>
              <TableCell className="font-medium">{agreement.id}</TableCell>
              <TableCell>{agreement.customer}</TableCell>
              <TableCell>{agreement.vehicle}</TableCell>
              <TableCell>{agreement.startDate}</TableCell>
              <TableCell>{agreement.endDate}</TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={getStatusColor(agreement.status)}
                >
                  {agreement.status.charAt(0).toUpperCase() + agreement.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>{formatCurrency(agreement.amount)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <FileText className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};