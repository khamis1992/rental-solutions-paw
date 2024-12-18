import { Car, Users, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateAgreementDialog } from "@/components/agreements/CreateAgreementDialog";
import { CreateVehicleDialog } from "@/components/vehicles/CreateVehicleDialog";
import { CreateCustomerDialog } from "@/components/customers/CreateCustomerDialog";

export const QuickActions = () => {
  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <CreateAgreementDialog />
          <CreateVehicleDialog />
          <CreateCustomerDialog />
          
          <button
            onClick={() => console.log("Report Issue clicked")}
            className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent transition-colors"
          >
            <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-red-50 text-red-500">
              <AlertCircle className="h-5 w-5" />
            </div>
            <span className="font-medium">Report Issue</span>
          </button>
        </div>
      </CardContent>
    </Card>
  );
};