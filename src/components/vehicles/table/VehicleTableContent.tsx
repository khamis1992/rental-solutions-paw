import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Vehicle } from "@/types/vehicle";
import { VehicleStatusCell } from "./VehicleStatusCell";
import { VehicleLocationCell } from "./VehicleLocationCell";
import { VehicleInsuranceCell } from "./VehicleInsuranceCell";
import { Link } from "react-router-dom";

interface VehicleTableContentProps {
  vehicles: Vehicle[];
}

export const VehicleTableContent = ({ vehicles }: VehicleTableContentProps) => {
  return (
    <TableBody>
      {vehicles.map((vehicle) => (
        <TableRow key={vehicle.id}>
          <TableCell>
            <Link 
              to={`/vehicles/${vehicle.id}`}
              className="text-primary hover:underline"
            >
              {vehicle.license_plate}
            </Link>
          </TableCell>
          <TableCell>{vehicle.make}</TableCell>
          <TableCell>{vehicle.model}</TableCell>
          <TableCell>{vehicle.year}</TableCell>
          <TableCell>{vehicle.mileage}</TableCell>
          <TableCell>
            <VehicleStatusCell 
              status={vehicle.status} 
              vehicleId={vehicle.id}
            />
          </TableCell>
          <TableCell>
            <VehicleLocationCell location={vehicle.location} />
          </TableCell>
          <TableCell>
            <VehicleInsuranceCell 
              insuranceCompany={vehicle.insurance_company} 
            />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  );
};