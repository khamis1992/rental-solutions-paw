import { CustomerList } from "@/components/customers/CustomerList";
import { CustomerStats } from "@/components/customers/CustomerStats";
import { CustomerFilters } from "@/components/customers/CustomerFilters";

export default function Customers() {
  return (
    <div className="w-full bg-background">
      <div className="pt-[calc(var(--header-height,56px)+2rem)] max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-secondary">Customers</h1>
          <p className="text-muted-foreground">Manage customer accounts and information</p>
        </div>
        
        <CustomerStats />
        <CustomerFilters />
        <CustomerList />
      </div>
    </div>
  );
}