import { Card, CardContent } from "@/components/ui/card";
import { GitBranch } from "lucide-react";

export const WorkflowGuide = () => {
  return (
    <Card className="border rounded-lg px-4">
      <CardContent className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          <h3 className="text-lg font-medium">Workflow Management</h3>
        </div>
        <div className="space-y-4">
          <section>
            <h4 className="font-medium mb-2">Core Features</h4>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>Create customized workflow templates for different case types</li>
              <li>Add and manage sequential steps with specific actions</li>
              <li>Configure automation triggers and notifications</li>
              <li>Track workflow progress and effectiveness</li>
            </ul>
          </section>
          <section>
            <h4 className="font-medium mb-2">Common Use Cases</h4>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>Debt Collection Process: From initial notice to resolution</li>
              <li>Contract Review: Document upload through final approval</li>
              <li>Settlement Negotiation: Case evaluation to agreement</li>
              <li>Compliance Checks: Document collection to final report</li>
            </ul>
          </section>
        </div>
      </CardContent>
    </Card>
  );
};