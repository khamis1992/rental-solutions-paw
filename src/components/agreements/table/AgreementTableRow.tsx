import { Link } from "react-router-dom";
import { Eye, Printer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";

interface Agreement {
  id: string;
  customer: {
    id: string;
    full_name: string;
  };
  vehicle: {
    id: string;
    make: string;
    model: string;
    year: number;
  };
  start_date: string;
  end_date: string;
  status: string;
  total_amount: number;
}

interface Props {
  agreement: Agreement;
  onViewContract: (id: string) => void;
  onPrintContract: (id: string) => void;
  onAgreementClick: (id: string) => void;
}

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

export const AgreementTableRow = ({ 
  agreement, 
  onViewContract, 
  onPrintContract,
  onAgreementClick 
}: Props) => {
  // Function to format dates properly
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    // Check if date is invalid (e.g., 1970-01-01) and return original string if it is
    if (date.getFullYear() === 1970 || isNaN(date.getTime())) {
      return dateString;
    }
    return date.toLocaleDateString();
  };

  return (
    <TableRow>
      <TableCell>
        <button
          onClick={() => onAgreementClick(agreement.id)}
          className="font-medium text-primary hover:underline"
        >
          {agreement.id}
        </button>
      </TableCell>
      <TableCell>
        <Link 
          to={`/customers/${agreement.customer.id}`}
          className="text-primary hover:underline"
        >
          {agreement.customer.full_name}
        </Link>
      </TableCell>
      <TableCell>
        {`${agreement.vehicle.year} ${agreement.vehicle.make} ${agreement.vehicle.model}`}
      </TableCell>
      <TableCell>{formatDate(agreement.start_date)}</TableCell>
      <TableCell>{formatDate(agreement.end_date)}</TableCell>
      <TableCell>
        <Badge
          variant="secondary"
          className={getStatusColor(agreement.status)}
        >
          {agreement.status.charAt(0).toUpperCase() + agreement.status.slice(1)}
        </Badge>
      </TableCell>
      <TableCell>{formatCurrency(agreement.total_amount)}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onViewContract(agreement.id)}
            title="View Contract"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onPrintContract(agreement.id)}
            title="Print Contract"
          >
            <Printer className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};