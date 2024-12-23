import { type FC } from 'react';
import { type SearchFiltersProps } from '../types/search.types';

export const SearchFilters: FC<SearchFiltersProps> = ({
  vehicles,
  customers,
  agreements,
  onVehicleSelect,
  onCustomerSelect,
  onAgreementSelect,
}) => {
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex space-x-4">
        <select onChange={(e) => onVehicleSelect(e.target.value)} className="border p-2">
          <option value="">Select Vehicle</option>
          {vehicles.map(vehicle => (
            <option key={vehicle.id} value={vehicle.id}>
              {vehicle.make} {vehicle.model} ({vehicle.year})
            </option>
          ))}
        </select>

        <select onChange={(e) => onCustomerSelect(e.target.value)} className="border p-2">
          <option value="">Select Customer</option>
          {customers.map(customer => (
            <option key={customer.id} value={customer.id}>
              {customer.full_name}
            </option>
          ))}
        </select>

        <select onChange={(e) => onAgreementSelect(e.target.value)} className="border p-2">
          <option value="">Select Agreement</option>
          {agreements.map(agreement => (
            <option key={agreement.id} value={agreement.id}>
              {agreement.agreement_number}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
