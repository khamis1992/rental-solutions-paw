import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GettingStartedGuide } from "@/components/help/GettingStartedGuide";
import { VehicleManagementGuide } from "@/components/help/VehicleManagementGuide";
import { CustomerManagementGuide } from "@/components/help/CustomerManagementGuide";
import { AgreementManagementGuide } from "@/components/help/AgreementManagementGuide";

const Help = () => {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold">Help Center</h1>
          <p className="text-muted-foreground mt-1">
            Find comprehensive guides and learn how to use AutoRent Pro effectively.
          </p>
        </div>

        <Tabs defaultValue="getting-started" className="space-y-4">
          <TabsList>
            <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
            <TabsTrigger value="vehicles">Vehicle Management</TabsTrigger>
            <TabsTrigger value="customers">Customer Management</TabsTrigger>
            <TabsTrigger value="agreements">Agreements</TabsTrigger>
          </TabsList>

          <TabsContent value="getting-started">
            <GettingStartedGuide />
          </TabsContent>

          <TabsContent value="vehicles">
            <VehicleManagementGuide />
          </TabsContent>

          <TabsContent value="customers">
            <CustomerManagementGuide />
          </TabsContent>

          <TabsContent value="agreements">
            <AgreementManagementGuide />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Help;