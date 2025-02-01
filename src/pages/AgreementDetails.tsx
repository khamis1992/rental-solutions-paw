import { useParams } from "react-router-dom";
import { useAgreementDetails } from "@/components/agreements/hooks/useAgreementDetails";
import { Skeleton } from "@/components/ui/skeleton";

const AgreementDetails = () => {
  const { id } = useParams();
  const { agreement, isLoading } = useAgreementDetails(id || "", !!id);

  if (isLoading) {
    return <Skeleton className="h-screen w-screen" />;
  }

  if (!agreement) {
    return <div>Agreement not found</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Agreement Details</h1>
      <div className="grid gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Agreement Information</h2>
          <div className="grid gap-4">
            <div>
              <span className="font-medium">Agreement Number:</span>
              <span className="ml-2">{agreement.agreement_number}</span>
            </div>
            <div>
              <span className="font-medium">Customer:</span>
              <span className="ml-2">{agreement.customer?.full_name}</span>
            </div>
            <div>
              <span className="font-medium">Vehicle:</span>
              <span className="ml-2">
                {agreement.vehicle?.make} {agreement.vehicle?.model} ({agreement.vehicle?.license_plate})
              </span>
            </div>
            <div>
              <span className="font-medium">Status:</span>
              <span className="ml-2">{agreement.status}</span>
            </div>
            <div>
              <span className="font-medium">Total Amount:</span>
              <span className="ml-2">{agreement.total_amount} QAR</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgreementDetails;