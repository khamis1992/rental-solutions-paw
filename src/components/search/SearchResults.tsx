import { FC } from 'react';

export interface SearchResultsProps {
  isLoading: boolean;
  error: Error | null;
  searchQuery: string;
  searchResults: {
    vehicles: Array<{
      id: string;
      make: string;
      model: string;
      year: number;
      license_plate: string;
    }>;
    customers: Array<{
      id: string;
      full_name: string;
      phone_number: string;
    }>;
    agreements: Array<{
      id: string;
      agreement_number: string;
      customer_name: string;
    }>;
  };
  handleSelect: (type: string, id: string) => void;
}

export const SearchResults: FC<SearchResultsProps> = ({
  isLoading,
  error,
  searchQuery,
  searchResults,
  handleSelect
}) => {
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <h2>Search Results for "{searchQuery}"</h2>
      <div>
        <h3>Vehicles</h3>
        {searchResults.vehicles.length > 0 ? (
          <ul>
            {searchResults.vehicles.map(vehicle => (
              <li key={vehicle.id} onClick={() => handleSelect('vehicle', vehicle.id)}>
                {vehicle.year} {vehicle.make} {vehicle.model} - {vehicle.license_plate}
              </li>
            ))}
          </ul>
        ) : (
          <p>No vehicles found.</p>
        )}
      </div>
      <div>
        <h3>Customers</h3>
        {searchResults.customers.length > 0 ? (
          <ul>
            {searchResults.customers.map(customer => (
              <li key={customer.id} onClick={() => handleSelect('customer', customer.id)}>
                {customer.full_name} - {customer.phone_number}
              </li>
            ))}
          </ul>
        ) : (
          <p>No customers found.</p>
        )}
      </div>
      <div>
        <h3>Agreements</h3>
        {searchResults.agreements.length > 0 ? (
          <ul>
            {searchResults.agreements.map(agreement => (
              <li key={agreement.id} onClick={() => handleSelect('agreement', agreement.id)}>
                Agreement #{agreement.agreement_number} - {agreement.customer_name}
              </li>
            ))}
          </ul>
        ) : (
          <p>No agreements found.</p>
        )}
      </div>
    </div>
  );
};
