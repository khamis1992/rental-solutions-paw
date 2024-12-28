import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Car, UserPlus2 } from "lucide-react";
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
    },
    {
      title: "Add Vehicle",
      icon: Car,
      dialog: CreateVehicleDialog,
      iconColor: "text-purple-500",
      bgColor: "bg-purple-50",
    },
    {
      title: "Add Customer",
      icon: UserPlus2,
      dialog: CreateCustomerDialog,
      iconColor: "text-green-500",
      bgColor: "bg-green-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {actions.map((action) => {
        const Icon = action.icon;
        const Dialog = action.dialog;
        return (
          <Dialog key={action.title}>
            <Card className="border hover:border-primary hover:shadow-md transition-all cursor-pointer">
              <CardContent className="flex items-center gap-4 p-6">
                <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${action.bgColor} ${action.iconColor}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <span className="font-medium text-lg">{action.title}</span>
              </CardContent>
            </Card>
          </Dialog>
        );
      })}
    </div>
  );
};