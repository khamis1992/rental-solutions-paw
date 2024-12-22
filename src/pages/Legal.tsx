import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { NonCompliantCustomers } from "@/components/legal/NonCompliantCustomers";
import { LegalDocumentTemplates } from "@/components/legal/templates/LegalDocumentTemplates";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Legal() {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Legal Management</h1>
        </div>

        <Tabs defaultValue="non-compliant" className="space-y-6">
          <TabsList>
            <TabsTrigger value="non-compliant">Non-Compliant Customers</TabsTrigger>
            <TabsTrigger value="templates">Document Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="non-compliant">
            <NonCompliantCustomers />
          </TabsContent>

          <TabsContent value="templates">
            <LegalDocumentTemplates />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}