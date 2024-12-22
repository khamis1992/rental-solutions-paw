import { Card } from "@/components/ui/card";
import { BookOpen, Users, Car, FileText, BarChart3, Banknote } from "lucide-react";

export const SystemOverview = () => {
  const features = [
    {
      icon: Users,
      title: "Customer Management",
      description: "Manage customer profiles, documents, and rental history efficiently."
    },
    {
      icon: Car,
      title: "Vehicle Management",
      description: "Track vehicle status, maintenance, and availability in real-time."
    },
    {
      icon: FileText,
      title: "Agreements",
      description: "Create and manage rental agreements with automated workflows."
    },
    {
      icon: Banknote,
      title: "Finance",
      description: "Handle transactions, track expenses, and manage financial reports."
    },
    {
      icon: BarChart3,
      title: "Reports & Analytics",
      description: "Generate insights with comprehensive reporting tools."
    }
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <h2 className="text-3xl font-semibold">Welcome to Rental Solutions</h2>
        <p className="text-lg text-muted-foreground">
          Rental Solutions is a comprehensive vehicle rental management system designed to streamline your rental operations.
          This help center will guide you through all features and functionalities of the system.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => (
          <Card key={index} className="p-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <feature.icon className="h-7 w-7 text-primary" />
                <h3 className="text-xl font-semibold">{feature.title}</h3>
              </div>
              <p className="text-base text-muted-foreground">{feature.description}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};