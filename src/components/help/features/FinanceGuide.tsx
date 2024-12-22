import { Card, CardContent } from "@/components/ui/card";
import { DollarSign } from "lucide-react";

export const FinanceGuide = () => {
  return (
    <Card className="border rounded-lg px-4">
      <CardContent className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          <h3 className="text-lg font-medium">Finance Module</h3>
        </div>
        <div className="space-y-4">
          <section>
            <h4 className="font-medium mb-2">Managing Costs</h4>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>Add fixed costs like rent, salaries, and insurance</li>
              <li>Track variable costs such as maintenance and fuel</li>
              <li>Categorize expenses for better financial analysis</li>
              <li>Set budget limits and receive overspending alerts</li>
            </ul>
          </section>
          <section>
            <h4 className="font-medium mb-2">Financial Reports</h4>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>Generate monthly and annual financial statements</li>
              <li>View profit and loss analysis</li>
              <li>Track revenue by vehicle or customer segment</li>
              <li>Export reports in various formats (PDF, CSV)</li>
            </ul>
          </section>
        </div>
      </CardContent>
    </Card>
  );
};