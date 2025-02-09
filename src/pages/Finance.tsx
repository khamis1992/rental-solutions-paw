
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FinancialOverview } from "@/components/finance/dashboard/FinancialOverview";
import { FinancialDashboard } from "@/components/finance/FinancialDashboard";
import { CarInstallmentContracts } from "@/components/finance/car-installments/CarInstallmentContracts";
import { PaymentManagement } from "@/components/finance/payments/PaymentManagement";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export default function Finance() {
  const isMobile = useIsMobile();

  return (
    <div className="container mx-auto py-4 md:py-6 space-y-6 md:space-y-8 px-4 md:px-6">
      <div className="flex flex-col space-y-3 md:space-y-4">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Financial Management
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Manage your financial operations, track payments, and monitor revenue
        </p>
      </div>

      <FinancialOverview />

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList 
          className={cn(
            "w-full justify-start overflow-x-auto no-scrollbar",
            "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
            "border-b rounded-none p-0 h-auto",
            isMobile ? "sticky top-0 z-10" : ""
          )}
        >
          <div className="flex">
            <TabsTrigger 
              value="dashboard" 
              className={cn(
                "flex items-center gap-2 px-4 py-3",
                "data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-50 data-[state=active]:to-purple-100",
                "data-[state=active]:dark:from-purple-900/50 data-[state=active]:dark:to-purple-900/30",
                "data-[state=active]:border-b-2 data-[state=active]:border-primary",
                "transition-all duration-200 ease-in-out",
                "rounded-none min-w-[120px] md:min-w-0"
              )}
            >
              Dashboard
            </TabsTrigger>
            <TabsTrigger 
              value="car-installments"
              className={cn(
                "flex items-center gap-2 px-4 py-3",
                "data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-50 data-[state=active]:to-blue-100",
                "data-[state=active]:dark:from-blue-900/50 data-[state=active]:dark:to-blue-900/30",
                "data-[state=active]:border-b-2 data-[state=active]:border-primary",
                "transition-all duration-200 ease-in-out",
                "rounded-none min-w-[120px] md:min-w-0"
              )}
            >
              Car Installments
            </TabsTrigger>
            <TabsTrigger 
              value="payments"
              className={cn(
                "flex items-center gap-2 px-4 py-3",
                "data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-50 data-[state=active]:to-green-100",
                "data-[state=active]:dark:from-green-900/50 data-[state=active]:dark:to-green-900/30",
                "data-[state=active]:border-b-2 data-[state=active]:border-primary",
                "transition-all duration-200 ease-in-out",
                "rounded-none min-w-[120px] md:min-w-0"
              )}
            >
              Payments
            </TabsTrigger>
          </div>
        </TabsList>
        <TabsContent value="dashboard" className="space-y-6 animate-fade-in">
          <FinancialDashboard />
        </TabsContent>
        <TabsContent value="car-installments" className="space-y-6 animate-fade-in">
          <CarInstallmentContracts />
        </TabsContent>
        <TabsContent value="payments" className="space-y-6 animate-fade-in">
          <PaymentManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
