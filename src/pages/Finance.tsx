import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { FinanceOverview } from "@/components/finance/FinanceOverview";
import { FinanceAIAssistant } from "@/components/finance/FinanceAIAssistant";
import { RentManagement } from "@/components/finance/RentManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Finance = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6">
        <h1 className="text-4xl font-bold tracking-tight">Financial Management</h1>
        
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="rent">Rent Management</TabsTrigger>
            <TabsTrigger value="ai-assistant">AI Assistant</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <FinanceOverview />
          </TabsContent>

          <TabsContent value="rent">
            <RentManagement />
          </TabsContent>

          <TabsContent value="ai-assistant">
            <FinanceAIAssistant />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Finance;