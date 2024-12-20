import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CustomerList } from "@/components/customers/CustomerList";
import { CustomerStats } from "@/components/customers/CustomerStats";
import { CreateCustomerDialog } from "@/components/customers/CreateCustomerDialog";
import { ImportExportCustomers } from "@/components/customers/ImportExportCustomers";

const Customers = () => {
  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Customers</h1>
        <div className="flex gap-2">
          <ImportExportCustomers />
          <CreateCustomerDialog />
        </div>
      </div>
      <CustomerStats />
      <div className="mt-6 space-y-4">
        <CustomerList />
      </div>
    </DashboardLayout>
  );
};

export default Customers;