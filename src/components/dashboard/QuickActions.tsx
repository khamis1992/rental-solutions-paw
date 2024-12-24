import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Car, UserPlus2, Plus } from "lucide-react";
import { toast } from "sonner";
import { CreateAgreementDialog } from "@/components/agreements/CreateAgreementDialog";
import { CreateVehicleDialog } from "@/components/vehicles/CreateVehicleDialog";
import { CreateCustomerDialog } from "@/components/customers/CreateCustomerDialog";

export const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      title: "New Agreement",
      icon: FileText,
      dialog: CreateAgreementDialog,
      iconColor: "text-blue-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-100",
    },
    {
      title: "Add Vehicle",
      icon: Car,
      dialog: CreateVehicleDialog,
      iconColor: "text-purple-500",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-100",
    },
    {
      title: "Add Customer",
      icon: UserPlus2,
      dialog: CreateCustomerDialog,
      iconColor: "text-green-500",
      bgColor: "bg-green-50",
      borderColor: "border-green-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {actions.map((action) => {
        const Icon = action.icon;
        const Dialog = action.dialog;
        return (
          <Dialog key={action.title}>
            <Card className={`border hover:shadow-md transition-all cursor-pointer ${action.borderColor}`}>
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className={`h-14 w-14 rounded-lg flex items-center justify-center ${action.bgColor} ${action.iconColor}`}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <span className="font-medium text-gray-800">{action.title}</span>
                </div>
              </CardContent>
            </Card>
          </Dialog>
        );
      })}
    </div>
  );
};