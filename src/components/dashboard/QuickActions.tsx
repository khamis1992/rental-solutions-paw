import { Car, Users, FileText, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateAgreementDialog } from "@/components/agreements/CreateAgreementDialog";

export const QuickActions = () => {
  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <CreateAgreementDialog />
          {[
            { icon: Car, label: "Add New Vehicle", color: "bg-blue-50 text-blue-500" },
            { icon: Users, label: "Register Customer", color: "bg-purple-50 text-purple-500" },
            { icon: AlertCircle, label: "Report Issue", color: "bg-red-50 text-red-500" }
          ].map((action, i) => (
            <button
              key={i}
              className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent transition-colors"
            >
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${action.color}`}>
                <action.icon className="h-5 w-5" />
              </div>
              <span className="font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};