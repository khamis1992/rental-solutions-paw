import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { CustomerList } from "@/components/customers/CustomerList";
import { CustomerFilters } from "@/components/customers/CustomerFilters";
import { CustomerStats } from "@/components/customers/CustomerStats";
import { CreateCustomerDialog } from "@/components/customers/CreateCustomerDialog";
import { useState } from "react";

const Customers = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <>
      <DashboardSidebar />
      <div className="flex-1">
        <DashboardHeader />
        <main className="container py-6 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
            <CreateCustomerDialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            />
          </div>
          <CustomerStats />
          <CustomerFilters />
          <CustomerList />
        </main>
      </div>
    </>
  );
};

export default Customers;