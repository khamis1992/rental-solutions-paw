import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { NonCompliantCustomers } from "@/components/legal/NonCompliantCustomers";
import { LegalCasesList } from "@/components/legal/LegalCasesList";
import { LegalAnalyticsDashboard } from "@/components/legal/analytics/LegalAnalyticsDashboard";
import { LegalReportsDashboard } from "@/components/legal/reports/LegalReportsDashboard";
import { WorkflowBuilder } from "@/components/legal/workflow/WorkflowBuilder";
import { AutomationSettings } from "@/components/legal/workflow/AutomationSettings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateLegalCaseDialog } from "@/components/legal/CreateLegalCaseDialog";
import { SmartSearchInput } from "@/components/legal/search/SmartSearchInput";

export default function Legal() {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-bold">Legal Management</h1>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <SmartSearchInput />
            <CreateLegalCaseDialog />
          </div>
        </div>

        <Tabs defaultValue="cases" className="space-y-6">
          <TabsList>
            <TabsTrigger value="cases">Legal Cases</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="non-compliant">Non-Compliant Customers</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
          </TabsList>

          <TabsContent value="cases">
            <LegalCasesList />
          </TabsContent>

          <TabsContent value="analytics">
            <LegalAnalyticsDashboard />
          </TabsContent>

          <TabsContent value="reports">
            <LegalReportsDashboard />
          </TabsContent>

          <TabsContent value="non-compliant">
            <NonCompliantCustomers />
          </TabsContent>

          <TabsContent value="automation" className="space-y-6">
            <WorkflowBuilder />
            <AutomationSettings />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}