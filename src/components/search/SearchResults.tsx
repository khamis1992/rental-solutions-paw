import React from "react";

interface SearchResult {
  vehicles?: {
    id: string;
    make: string;
    model: string;
    year: number;
    license_plate: string;
  }[];
  customers?: {
    id: string;
    full_name: string;
    phone_number: string;
  }[];
  agreements?: {
    id: string;
    agreement_number: string;
    customer?: {
      full_name: string;
    };
    vehicle?: {
      make: string;
      model: string;
    };
  }[];
}

export interface SearchResultsProps {
  isLoading?: boolean;
  error?: Error | null;
  searchQuery: string;
  searchResults: SearchResult;
  handleSelect: (type: string, id: string) => void;
}

export const SearchResults = ({
  isLoading,
  error,
  searchQuery,
  searchResults,
  handleSelect
}: SearchResultsProps) => {
  if (isLoading) {
    return <div className="text-center py-4">Loading results...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">Error loading results: {error.message}</div>;
  }

  return (
    <div className="space-y-4">
      {searchResults.vehicles && searchResults.vehicles.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold">Vehicles</h3>
          <ul>
            {searchResults.vehicles.map(vehicle => (
              <li key={vehicle.id} onClick={() => handleSelect("vehicle", vehicle.id)}>
                {vehicle.year} {vehicle.make} {vehicle.model} ({vehicle.license_plate})
              </li>
            ))}
          </ul>
        </div>
      )}

      {searchResults.customers && searchResults.customers.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold">Customers</h3>
          <ul>
            {searchResults.customers.map(customer => (
              <li key={customer.id} onClick={() => handleSelect("customer", customer.id)}>
                {customer.full_name} - {customer.phone_number}
              </li>
            ))}
          </ul>
        </div>
      )}

      {searchResults.agreements && searchResults.agreements.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold">Agreements</h3>
          <ul>
            {searchResults.agreements.map(agreement => (
              <li key={agreement.id} onClick={() => handleSelect("agreement", agreement.id)}>
                Agreement No: {agreement.agreement_number} - Customer: {agreement.customer?.full_name} - Vehicle: {agreement.vehicle?.make} {agreement.vehicle?.model}
              </li>
            ))}
          </ul>
        </div>
      )}

      {searchResults.vehicles?.length === 0 && searchResults.customers?.length === 0 && searchResults.agreements?.length === 0 && (
        <div className="text-center py-4">No results found for "{searchQuery}"</div>
      )}
    </div>
  );
};
