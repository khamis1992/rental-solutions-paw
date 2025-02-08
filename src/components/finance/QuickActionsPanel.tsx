
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, FileText, Printer, Bell, DollarSign, ChartBar } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

export const QuickActionsPanel = () => {
  const isMobile = useIsMobile();
  
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
        <div className={cn(
          "grid gap-4",
          isMobile ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3"
        )}>
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                variant="outline"
                className={cn(
                  "flex flex-col items-center gap-2",
                  "h-auto py-4 transition-all duration-300",
                  "hover:bg-primary/5 hover:border-primary/50",
                  isMobile && "min-h-[80px] active:scale-95"
                )}
                onClick={(e) => {
                  if (isMobile && navigator.vibrate) {
                    navigator.vibrate(50);
                  }
                  action.onClick();
                }}
              >
                <Icon className="h-6 w-6" />
                <span className="text-sm text-center">{action.label}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
