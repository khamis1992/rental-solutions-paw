import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { NonCompliantCustomers } from "@/components/legal/NonCompliantCustomers";
import { LegalCasesList } from "@/components/legal/LegalCasesList";
import { LegalAnalyticsDashboard } from "@/components/legal/analytics/LegalAnalyticsDashboard";
import { LegalReportsDashboard } from "@/components/legal/reports/LegalReportsDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateLegalCaseDialog } from "@/components/legal/CreateLegalCaseDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Legal() {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Legal Management</h1>
          <CreateLegalCaseDialog />
        </div>

        <Tabs defaultValue="cases" className="space-y-6">
          <TabsList>
            <TabsTrigger value="cases">Legal Cases</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="non-compliant">Non-Compliant Customers</TabsTrigger>
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
        </Tabs>
      </div>
    </DashboardLayout>
  );
}