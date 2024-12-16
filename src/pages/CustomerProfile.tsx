import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { CustomerProfileView } from "@/components/customers/CustomerProfileView";
import { useParams } from "react-router-dom";

const CustomerProfile = () => {
  const { id } = useParams();

  return (
    <>
      <DashboardSidebar />
      <div className="flex-1">
        <DashboardHeader />
        <main className="container py-6">
          <CustomerProfileView customerId={id!} />
        </main>
      </div>
    </>
  );
};

export default CustomerProfile;