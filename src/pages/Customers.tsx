import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { CustomerList } from "@/components/customers/CustomerList";
import { CustomerStats } from "@/components/customers/CustomerStats";
import { CustomerFilters } from "@/components/customers/CustomerFilters";
import { CreateCustomerDialog } from "@/components/customers/CreateCustomerDialog";

const Customers = () => {
  return (
    <>
      <DashboardSidebar />
      <div className="flex-1">
        <DashboardHeader />
        <main className="container py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Customers</h1>
            <CreateCustomerDialog open={false} onOpenChange={() => {}} />
          </div>
          
          <CustomerStats />
          
          <div className="mt-6 space-y-4">
            <CustomerFilters />
            <CustomerList />
          </div>
        </main>
      </div>
    </>
  );
};

export default Customers;