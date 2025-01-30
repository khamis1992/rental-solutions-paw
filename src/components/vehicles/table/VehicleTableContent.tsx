import { VehicleLocationCell } from './VehicleLocationCell';
import { VehicleInsuranceCell } from './VehicleInsuranceCell';
import { Vehicle } from '@/types/vehicle';

export interface VehicleTableContentProps {
  vehicles: Vehicle[];
  onSelectionChange?: (selectedIds: string[]) => void;
}

export const VehicleTableContent = ({ vehicles, onSelectionChange }: VehicleTableContentProps) => {
  return (
    <div>
      {vehicles.map((vehicle) => (
        <div key={vehicle.id}>
          <VehicleLocationCell 
            vehicleId={vehicle.id}
            location={vehicle.location || ''}
            isEditing={false}
            onEditStart={() => {}}
            onEditEnd={() => {}}
          />
          <VehicleInsuranceCell 
            vehicleId={vehicle.id}
            insuranceProvider={vehicle.insurance_company || ''}
            isEditing={false}
            onEditStart={() => {}}
            onEditEnd={() => {}}
          />
        </div>
      ))}
    </div>
  );
};
