import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CarInstallmentPayments } from "./CarInstallmentPayments";
import { CarInstallmentAnalytics } from "./CarInstallmentAnalytics";
import { PaymentMonitoring } from "./PaymentMonitoring";
import { type CarInstallmentContract, type CarInstallmentPayment } from "@/types/finance/car-installment.types";
import { toast } from "sonner";

export const CarInstallmentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedContract, setSelectedContract] = useState<CarInstallmentContract | null>(null);

  // Validate UUID format
  const isValidUUID = (uuid: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };

  const { data: contract, isLoading: isLoadingContract } = useQuery({
    queryKey: ["car-installment-contract", id],
    queryFn: async () => {
      if (!id || !isValidUUID(id)) {
        toast.error("Invalid contract ID");
        return null;
      }
      
      const { data, error } = await supabase
        .from("car_installment_contracts")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching contract:', error);
        toast.error(error.message);
        throw error;
      }
      
      if (!data) {
        toast.error("Contract not found");
        return null;
      }

      return data as CarInstallmentContract;
    },
    enabled: !!id && isValidUUID(id)
  });

  useEffect(() => {
    if (contract) {
      setSelectedContract(contract);
    }
  }, [contract]);

  if (!id || !isValidUUID(id)) {
    return <div className="p-4">Invalid contract ID</div>;
  }

  if (isLoadingContract) {
    return <div className="p-4">Loading...</div>;
  }

  if (!selectedContract) {
    return <div className="p-4">Contract not found</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Contract Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold">Car Type</h3>
              <p>{selectedContract.car_type}</p>
            </div>
            <div>
              <h3 className="font-semibold">Category</h3>
              <p>{selectedContract.category}</p>
            </div>
            <div>
              <h3 className="font-semibold">Model Year</h3>
              <p>{selectedContract.model_year}</p>
            </div>
            <div>
              <h3 className="font-semibold">Number of Cars</h3>
              <p>{selectedContract.number_of_cars}</p>
            </div>
            <div>
              <h3 className="font-semibold">Price per Car</h3>
              <p>{selectedContract.price_per_car} QAR</p>
            </div>
            <div>
              <h3 className="font-semibold">Total Contract Value</h3>
              <p>{selectedContract.total_contract_value} QAR</p>
            </div>
            <div>
              <h3 className="font-semibold">Amount Paid</h3>
              <p>{selectedContract.amount_paid} QAR</p>
            </div>
            <div>
              <h3 className="font-semibold">Amount Pending</h3>
              <p>{selectedContract.amount_pending} QAR</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <CarInstallmentPayments 
        contractId={selectedContract.id} 
      />
      <CarInstallmentAnalytics 
        contractId={selectedContract.id} 
      />
      <PaymentMonitoring 
        contractId={selectedContract.id} 
      />
    </div>
  );
};