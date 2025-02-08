
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FinancialOverview } from "@/components/finance/dashboard/FinancialOverview";
import { FinancialDashboard } from "@/components/finance/FinancialDashboard";
import { CarInstallmentContracts } from "@/components/finance/car-installments/CarInstallmentContracts";
import { PaymentManagement } from "@/components/finance/payments/PaymentManagement";

export default function Finance() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Financial Management</h1>
        <p className="text-muted-foreground">
          Manage your financial operations, track payments, and monitor revenue
        </p>
      </div>

      <FinancialOverview />

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList className="w-full flex overflow-x-auto no-scrollbar snap-x snap-mandatory touch-pan-x">
          <TabsTrigger value="dashboard" className="touch-target">Dashboard</TabsTrigger>
          <TabsTrigger value="car-installments" className="touch-target">Car Installments</TabsTrigger>
          <TabsTrigger value="payments" className="touch-target">Payments</TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard" className="animate-fade-in">
          <FinancialDashboard />
        </TabsContent>
        <TabsContent value="car-installments" className="animate-fade-in">
          <CarInstallmentContracts />
        </TabsContent>
        <TabsContent value="payments" className="animate-fade-in">
          <PaymentManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
