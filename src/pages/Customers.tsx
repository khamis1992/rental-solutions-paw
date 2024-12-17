import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CustomerList } from "@/components/customers/CustomerList";
import { CustomerStats } from "@/components/customers/CustomerStats";
import { CustomerFilters } from "@/components/customers/CustomerFilters";
import { CreateCustomerDialog } from "@/components/customers/CreateCustomerDialog";

const Customers = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Customers</h1>
        <CreateCustomerDialog 
          open={isDialogOpen} 
          onOpenChange={setIsDialogOpen}
        />
      </div>
      <CustomerStats />
      <div className="mt-6 space-y-4">
        <CustomerFilters />
        <CustomerList />
      </div>
    </DashboardLayout>
  );
};

export default Customers;