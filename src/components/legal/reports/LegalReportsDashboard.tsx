import { CustomReportBuilder } from "./CustomReportBuilder";
import { CaseStatusReport } from "./CaseStatusReport";
import { ComplianceReport } from "./ComplianceReport";
import { SettlementReport } from "./SettlementReport";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const LegalReportsDashboard = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="custom" className="space-y-6">
        <TabsList>
          <TabsTrigger value="custom">Custom Reports</TabsTrigger>
          <TabsTrigger value="status">Status Reports</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Reports</TabsTrigger>
          <TabsTrigger value="settlement">Settlement Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="custom">
          <CustomReportBuilder />
        </TabsContent>

        <TabsContent value="status">
          <CaseStatusReport />
        </TabsContent>

        <TabsContent value="compliance">
          <ComplianceReport />
        </TabsContent>

        <TabsContent value="settlement">
          <SettlementReport />
        </TabsContent>
      </Tabs>
    </div>
  );
};