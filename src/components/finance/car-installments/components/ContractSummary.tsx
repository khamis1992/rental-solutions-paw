import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Plus } from "lucide-react";

interface ContractSummaryProps {
  contract: {
    car_type: string;
    number_of_cars: number;
    model_year: number;
    price_per_car: number;
    total_contract_value: number;
    amount_paid: number;
    amount_pending: number;
    total_installments: number;
    remaining_installments: number;
  };
  onAddPayment: () => void;
}

export const ContractSummary = ({ contract, onAddPayment }: ContractSummaryProps) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-sm font-medium">Car Type</p>
            <p className="text-2xl font-bold">{contract.car_type}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Number of Cars</p>
            <p className="text-2xl font-bold">{contract.number_of_cars || 1}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Model Year</p>
            <p className="text-2xl font-bold">{contract.model_year}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Price per Car</p>
            <p className="text-2xl font-bold">{formatCurrency(contract.price_per_car)}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-sm font-medium">Total Contract Value</p>
            <p className="text-2xl font-bold">{formatCurrency(contract.total_contract_value)}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Amount Paid</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(contract.amount_paid)}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Amount Pending</p>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(contract.amount_pending)}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Installments</p>
            <p className="text-2xl font-bold">
              {contract.remaining_installments} / {contract.total_installments}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <Button onClick={onAddPayment}>
            <Plus className="h-4 w-4 mr-2" />
            Add Payment Installment
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};