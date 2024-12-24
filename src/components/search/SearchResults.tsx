import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface SearchResultsProps {
  results: any[];
  entityType: "customers" | "rentals" | "vehicles";
}

export const SearchResults = ({ results, entityType }: SearchResultsProps) => {
  const navigate = useNavigate();

  const handleRowClick = (id: string) => {
    switch (entityType) {
      case "customers":
        navigate(`/customers/${id}`);
        break;
      case "rentals":
        navigate(`/agreements/${id}`);
        break;
      case "vehicles":
        navigate(`/vehicles/${id}`);
        break;
    }
  };

  const renderHeaders = () => {
    switch (entityType) {
      case "customers":
        return (
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        );
      case "rentals":
        return (
          <TableRow>
            <TableHead>Agreement #</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Start Date</TableHead>
          </TableRow>
        );
      case "vehicles":
        return (
          <TableRow>
            <TableHead>Vehicle</TableHead>
            <TableHead>License Plate</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Mileage</TableHead>
          </TableRow>
        );
    }
  };

  const renderRow = (item: any) => {
    switch (entityType) {
      case "customers":
        return (
          <TableRow
            key={item.id}
            className="cursor-pointer hover:bg-muted/50"
            onClick={() => handleRowClick(item.id)}
          >
            <TableCell>{item.full_name}</TableCell>
            <TableCell>{item.phone_number}</TableCell>
            <TableCell>{item.status}</TableCell>
            <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
          </TableRow>
        );
      case "rentals":
        return (
          <TableRow
            key={item.id}
            className="cursor-pointer hover:bg-muted/50"
            onClick={() => handleRowClick(item.id)}
          >
            <TableCell>{item.agreement_number}</TableCell>
            <TableCell>{item.customer?.full_name}</TableCell>
            <TableCell>{item.status}</TableCell>
            <TableCell>
              {item.start_date
                ? new Date(item.start_date).toLocaleDateString()
                : "N/A"}
            </TableCell>
          </TableRow>
        );
      case "vehicles":
        return (
          <TableRow
            key={item.id}
            className="cursor-pointer hover:bg-muted/50"
            onClick={() => handleRowClick(item.id)}
          >
            <TableCell>{`${item.year} ${item.make} ${item.model}`}</TableCell>
            <TableCell>{item.license_plate}</TableCell>
            <TableCell>{item.status}</TableCell>
            <TableCell>{item.mileage?.toLocaleString() || "N/A"}</TableCell>
          </TableRow>
        );
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>{renderHeaders()}</TableHeader>
        <TableBody>{results.map((item) => renderRow(item))}</TableBody>
      </Table>
    </div>
  );
};