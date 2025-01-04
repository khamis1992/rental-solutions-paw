import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RevenueDashboard } from "@/components/finance/dashboard/RevenueDashboard";
import { TransactionCategorization } from "@/components/finance/transactions/TransactionCategorization";
import { PaymentManagement } from "@/components/finance/payments/PaymentManagement";
import { RawDataView } from "@/components/finance/raw-data/RawDataView";
import { CarInstallmentContracts } from "@/components/finance/car-installments/CarInstallmentContracts";
import { CarInstallmentDetails } from "@/components/finance/car-installments/CarInstallmentDetails";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParams, Routes, Route } from "react-router-dom";
import { 
  BarChart3, 
  CreditCard, 
  FileText, 
  Tags, 
  Database,
  Car
} from "lucide-react";

const Finance = () => {
  const { id } = useParams();

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Financial Management</h1>
      
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="w-full justify-start bg-background border-b rounded-none p-0 h-auto">
          <div className="flex overflow-x-auto no-scrollbar">
            <TabsTrigger 
              value="dashboard" 
              className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </TabsTrigger>

            <TabsTrigger 
              value="payments" 
              className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              <CreditCard className="h-4 w-4" />
              <span>Payments</span>
            </TabsTrigger>

            <TabsTrigger 
              value="transactions" 
              className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              <FileText className="h-4 w-4" />
              <span>Transactions</span>
            </TabsTrigger>

            <TabsTrigger 
              value="categorization" 
              className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              <Tags className="h-4 w-4" />
              <span>Categorization</span>
            </TabsTrigger>

            <TabsTrigger 
              value="raw-data" 
              className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              <Database className="h-4 w-4" />
              <span>Raw Data</span>
            </TabsTrigger>

            <TabsTrigger 
              value="car-installments" 
              className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              <Car className="h-4 w-4" />
              <span>Car Installments</span>
            </TabsTrigger>
          </div>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <RevenueDashboard />
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <PaymentManagement />
        </TabsContent>

        <TabsContent value="transactions">
          {/* Transaction management components will go here */}
        </TabsContent>

        <TabsContent value="categorization">
          <TransactionCategorization />
        </TabsContent>

        <TabsContent value="raw-data">
          <RawDataView />
        </TabsContent>

        <TabsContent value="car-installments">
          <Routes>
            <Route index element={<CarInstallmentContracts />} />
            <Route path=":id/*" element={<CarInstallmentDetails />} />
          </Routes>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Finance;