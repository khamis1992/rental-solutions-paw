import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CustomerProfileView } from "@/components/customers/CustomerProfileView";
import { useParams } from "react-router-dom";

const CustomerProfile = () => {
  const { id } = useParams();

  if (!id) {
    return <div>Customer ID not found</div>;
  }

  return (
    <DashboardLayout>
      <CustomerProfileView customerId={id} />
    </DashboardLayout>
  );
};

export default CustomerProfile;