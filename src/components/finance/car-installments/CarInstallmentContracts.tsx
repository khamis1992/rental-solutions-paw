import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { Loader2, Car, CreditCard, DollarSign, ChartBar } from "lucide-react";
import { CreateContractDialog } from "./CreateContractDialog";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

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
  number_of_cars: number;
}

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: number;
  className?: string;
}

const MetricCard = ({ title, value, icon, trend, className }: MetricCardProps) => (
  <Card className={`${className} transition-all duration-200 hover:shadow-md`}>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-lg font-bold">{value}</p>
          {trend !== undefined && (
            <p className={`text-sm ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </p>
          )}
        </div>
        <div className="p-3 rounded-full bg-primary/10">
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

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

  const calculateMetrics = (data: CarInstallmentContract[] = []) => {
    const totalValue = data.reduce((sum, contract) => sum + contract.total_contract_value, 0);
    const totalPaid = data.reduce((sum, contract) => sum + contract.amount_paid, 0);
    const activeContracts = data.length;
    const upcomingPayments = data.reduce((sum, contract) => sum + contract.installment_value, 0);

    return {
      totalValue,
      totalPaid,
      activeContracts,
      upcomingPayments
    };
  };

  const metrics = calculateMetrics(contracts);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const handleContractClick = (contractId: string) => {
    navigate(`/finance/car-installments/${contractId}`);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Contracts"
          value={metrics.activeContracts.toString()}
          icon={<Car className="h-6 w-6 text-primary" />}
          trend={5}
          className="bg-gradient-to-br from-[#FDE1D3] to-[#FEC6A1] dark:from-orange-900/50 dark:to-orange-800/30"
        />
        <MetricCard
          title="Total Portfolio Value"
          value={formatCurrency(metrics.totalValue)}
          icon={<DollarSign className="h-6 w-6 text-primary" />}
          trend={8}
          className="bg-gradient-to-br from-[#FFDEE2] to-[#FFD1D8] dark:from-rose-900/50 dark:to-rose-800/30"
        />
        <MetricCard
          title="Total Collections"
          value={formatCurrency(metrics.totalPaid)}
          icon={<CreditCard className="h-6 w-6 text-primary" />}
          trend={-2}
          className="bg-gradient-to-br from-[#D3E4FD] to-[#B6D4FA] dark:from-blue-900/50 dark:to-blue-800/30"
        />
        <MetricCard
          title="Upcoming Payments"
          value={formatCurrency(metrics.upcomingPayments)}
          icon={<ChartBar className="h-6 w-6 text-primary" />}
          trend={3}
          className="bg-gradient-to-br from-[#E5DEFF] to-[#D3C6FF] dark:from-purple-900/50 dark:to-purple-800/30"
        />
      </div>

      <Card className="bg-gradient-to-br from-background to-muted/50">
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
                  <TableHead className="text-center">Number of Cars</TableHead>
                  <TableHead className="text-right">Price per Car</TableHead>
                  <TableHead className="text-right">Total Value</TableHead>
                  <TableHead className="text-right">Progress</TableHead>
                  <TableHead className="text-right">Amount Pending</TableHead>
                  <TableHead className="text-center">Installments</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts?.map((contract) => {
                  const progressPercentage = (contract.amount_paid / contract.total_contract_value) * 100;
                  
                  return (
                    <TableRow 
                      key={contract.id}
                      className="transition-colors hover:bg-muted/50"
                    >
                      <TableCell>
                        <Button 
                          variant="link" 
                          className="p-0 h-auto font-medium hover:text-primary"
                          onClick={() => handleContractClick(contract.id)}
                        >
                          {contract.car_type}
                        </Button>
                      </TableCell>
                      <TableCell>{contract.model_year}</TableCell>
                      <TableCell className="text-center">{contract.number_of_cars || 1}</TableCell>
                      <TableCell className="text-right">{formatCurrency(contract.price_per_car)}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(contract.total_contract_value)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2">
                          <Progress value={progressPercentage} className="w-full" />
                          <span className="text-sm text-muted-foreground w-12">
                            {progressPercentage.toFixed(0)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium text-red-600">
                        {formatCurrency(contract.amount_pending)}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {contract.remaining_installments} / {contract.total_installments}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {!contracts?.length && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      <div className="py-6 space-y-4">
                        <p>No contracts found</p>
                        <CreateContractDialog />
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
