import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CustomerList } from "@/components/customers/CustomerList";
import { CustomerStats } from "@/components/customers/CustomerStats";
import { CreateCustomerDialog } from "@/components/customers/CreateCustomerDialog";
import { ImportExportCustomers } from "@/components/customers/ImportExportCustomers";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const Customers = () => {
  return (
    <DashboardLayout>
      {/* Header Section with Search and Actions */}
      <div className="flex flex-col gap-6 md:gap-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Customers</h1>
            <p className="text-muted-foreground mt-1">
              Manage and monitor your customer base
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                className="pl-8 w-[200px] md:w-[300px]"
              />
            </div>
            <div className="flex gap-2">
              <ImportExportCustomers />
              <CreateCustomerDialog />
            </div>
          </div>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid gap-4 md:gap-6">
          <CustomerStats />
        </div>

        {/* Main Content Area */}
        <div className="rounded-lg border bg-card">
          <div className="p-1">
            <CustomerList />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Customers;