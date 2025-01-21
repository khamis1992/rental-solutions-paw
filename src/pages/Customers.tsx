import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CustomerList } from "@/components/customers/CustomerList";

const Customers = () => {
  return (
    <DashboardLayout>
      <div className="w-full bg-background">
        <div className="pt-[calc(var(--header-height,56px)+2rem)] max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <CustomerList />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Customers;