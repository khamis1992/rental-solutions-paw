import { Card } from "@/components/ui/card";
import { BookOpen, Users, Car, FileText, BarChart3, Banknote, AlertTriangle } from "lucide-react";

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
      icon: AlertTriangle,
      title: "Traffic Fines",
      description: "Process and manage traffic fines with automatic assignment capabilities."
    },
    {
      icon: BarChart3,
      title: "Reports & Analytics",
      description: "Generate comprehensive insights with advanced reporting tools."
    }
  ];

  return (
    <div className="w-full space-y-8">
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Welcome to Rental Solutions</h2>
        <p className="text-base text-muted-foreground leading-relaxed max-w-3xl">
          Rental Solutions is a comprehensive vehicle rental management system designed to streamline your rental operations.
          This help center will guide you through all features and functionalities of the system.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => (
          <Card key={index} className="p-6 hover:shadow-md transition-shadow">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <feature.icon className="h-5 w-5 text-primary flex-shrink-0" />
                <h3 className="text-lg font-medium">{feature.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};