import { useParams } from "react-router-dom";
import { CustomerProfileView } from "@/components/customers/CustomerProfileView";

const CustomerProfile = () => {
  const { id } = useParams();

  return (
    <div className="container mx-auto p-6">
      <CustomerProfileView customerId={id!} />
    </div>
  );
};

export default CustomerProfile;