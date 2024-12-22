import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";

export const DashboardGuide = () => {
  return (
    <Card className="border rounded-lg px-4">
      <CardContent className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          <h3 className="text-lg font-medium">Dashboard Overview</h3>
        </div>
        <div className="space-y-4">
          <section>
            <h4 className="font-medium mb-2">Navigating the Dashboard</h4>
            <p className="text-sm text-muted-foreground mb-2">
              The dashboard provides a comprehensive overview of your rental operations:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>Real-time metrics showing active rentals, revenue, and fleet status</li>
              <li>Quick access to recent activities and pending tasks</li>
              <li>Interactive charts displaying key performance indicators</li>
              <li>Customizable widgets for personalized monitoring</li>
              <li>Alert system for important notifications</li>
            </ul>
          </section>
          <section>
            <h4 className="font-medium mb-2">Data Visualizations</h4>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>Vehicle status distribution chart shows fleet availability</li>
              <li>Revenue trends graph displays financial performance</li>
              <li>Customer activity timeline tracks recent interactions</li>
              <li>Maintenance schedule overview for fleet management</li>
            </ul>
          </section>
        </div>
      </CardContent>
    </Card>
  );
};