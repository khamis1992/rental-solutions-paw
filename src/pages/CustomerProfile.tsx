import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { CustomerProfileView } from "@/components/customers/CustomerProfileView";
import { useParams } from "react-router-dom";

const CustomerProfile = () => {
  const { id } = useParams();

  if (!id) {
    return <div>Customer ID not found</div>;
  }

  return (
    <div className="flex h-screen">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-6">
          <CustomerProfileView customerId={id} />
        </main>
      </div>
    </div>
  );
};

export default CustomerProfile;