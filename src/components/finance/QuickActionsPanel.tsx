import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, FileText, Printer, Bell, DollarSign, ChartBar } from "lucide-react";

export const QuickActionsPanel = () => {
  const quickActions = [
    {
      icon: Plus,
      label: "New Transaction",
      onClick: () => console.log("New Transaction clicked"),
    },
    {
      icon: FileText,
      label: "Generate Report",
      onClick: () => console.log("Generate Report clicked"),
    },
    {
      icon: Printer,
      label: "Print Statement",
      onClick: () => console.log("Print Statement clicked"),
    },
    {
      icon: Bell,
      label: "Payment Reminders",
      onClick: () => console.log("Payment Reminders clicked"),
    },
    {
      icon: DollarSign,
      label: "Record Payment",
      onClick: () => console.log("Record Payment clicked"),
    },
    {
      icon: ChartBar,
      label: "View Analytics",
      onClick: () => console.log("View Analytics clicked"),
    },
  ];

  return (
    <Card className="bg-gradient-to-br from-background to-muted/50">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                variant="outline"
                className="flex flex-col items-center gap-2 h-auto py-4 hover:bg-primary/5 hover:border-primary/50 transition-all duration-300"
                onClick={action.onClick}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm text-center">{action.label}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}