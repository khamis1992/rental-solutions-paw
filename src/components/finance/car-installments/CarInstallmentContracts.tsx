import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { CreateContractDialog } from "./CreateContractDialog";
import { useNavigate } from "react-router-dom";

interface CarInstallmentContract {
  id: string;
  car_type: string;
  model_year: number;
  price_per_car: number;
  total_contract_value: number;
  amount_paid: number;
  amount_pending: number;
  total_installments: number;
  remaining_installments: number;
  installment_value: number;
}

export const CarInstallmentContracts = () => {
  const navigate = useNavigate();
  
  const { data: contracts, isLoading } = useQuery({
    queryKey: ["car-installment-contracts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("car_installment_contracts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as CarInstallmentContract[];
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Car Installment Contracts</CardTitle>
        <CreateContractDialog />
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contract Name</TableHead>
                <TableHead>Model Year</TableHead>
                <TableHead className="text-right">Price per Car</TableHead>
                <TableHead className="text-right">Total Value</TableHead>
                <TableHead className="text-right">Amount Paid</TableHead>
                <TableHead className="text-right">Amount Pending</TableHead>
                <TableHead className="text-center">Remaining Installments</TableHead>
                <TableHead className="text-right">Installment Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contracts?.map((contract) => (
                <TableRow 
                  key={contract.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/finance/car-installments/${contract.id}`)}
                >
                  <TableCell>{contract.car_type}</TableCell>
                  <TableCell>{contract.model_year}</TableCell>
                  <TableCell className="text-right">{formatCurrency(contract.price_per_car)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(contract.total_contract_value)}</TableCell>
                  <TableCell className="text-right font-medium text-green-600">
                    {formatCurrency(contract.amount_paid)}
                  </TableCell>
                  <TableCell className="text-right font-medium text-red-600">
                    {formatCurrency(contract.amount_pending)}
                  </TableCell>
                  <TableCell className="text-center">
                    {contract.remaining_installments} / {contract.total_installments}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(contract.installment_value)}
                  </TableCell>
                </TableRow>
              ))}
              {!contracts?.length && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    No contracts found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};