import { Car, Users, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateAgreementDialog } from "@/components/agreements/CreateAgreementDialog";
import { CreateVehicleDialog } from "@/components/vehicles/CreateVehicleDialog";
import { CreateCustomerDialog } from "@/components/customers/CreateCustomerDialog";
import { useState } from "react";

export const QuickActions = () => {
  const [openVehicleDialog, setOpenVehicleDialog] = useState(false);
  const [openCustomerDialog, setOpenCustomerDialog] = useState(false);

  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <CreateAgreementDialog />
          <CreateVehicleDialog open={openVehicleDialog} onOpenChange={setOpenVehicleDialog} />
          <CreateCustomerDialog open={openCustomerDialog} onOpenChange={setOpenCustomerDialog} />
          
          {[
            { 
              icon: Car, 
              label: "Add New Vehicle", 
              color: "bg-blue-50 text-blue-500",
              onClick: () => setOpenVehicleDialog(true)
            },
            { 
              icon: Users, 
              label: "Register Customer", 
              color: "bg-purple-50 text-purple-500",
              onClick: () => setOpenCustomerDialog(true)
            },
            { 
              icon: AlertCircle, 
              label: "Report Issue", 
              color: "bg-red-50 text-red-500",
              onClick: () => console.log("Report Issue clicked")
            }
          ].map((action, i) => (
            <button
              key={i}
              onClick={action.onClick}
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