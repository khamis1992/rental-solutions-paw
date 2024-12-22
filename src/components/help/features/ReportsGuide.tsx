import { Card, CardContent } from "@/components/ui/card";
import { ChartBar } from "lucide-react";

export const ReportsGuide = () => {
  return (
    <Card className="border rounded-lg px-4">
      <CardContent className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <ChartBar className="h-5 w-5" />
          <h3 className="text-lg font-medium">Reports & Analytics</h3>
        </div>
        <div className="space-y-4">
          <section>
            <h4 className="font-medium mb-2">Available Reports</h4>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>Fleet utilization and performance metrics</li>
              <li>Customer behavior and satisfaction analysis</li>
              <li>Financial performance and forecasting</li>
              <li>Operational efficiency reports</li>
            </ul>
          </section>
          <section>
            <h4 className="font-medium mb-2">Customization Options</h4>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>Filter data by date range, vehicle type, or customer segment</li>
              <li>Customize chart types and visualizations</li>
              <li>Save report templates for quick access</li>
              <li>Schedule automated report generation</li>
            </ul>
          </section>
        </div>
      </CardContent>
    </Card>
  );
};