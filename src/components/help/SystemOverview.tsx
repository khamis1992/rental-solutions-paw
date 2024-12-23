import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { LucideIcon, Users, Car, FileText, Banknote, BarChart3 } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Users,
  Car,
  FileText,
  Banknote,
  BarChart3
};

export const SystemOverview = () => {
  const { data: features, isLoading } = useQuery({
    queryKey: ['help-features'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('help_features')
        .select('*')
        .order('created_at');
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="w-full space-y-6">
      <div className="space-y-4 max-w-4xl w-full">
        <h2 className="text-2xl font-semibold text-left">Welcome to Rental Solutions</h2>
        <p className="text-base text-muted-foreground text-left leading-relaxed">
          Rental Solutions is a comprehensive vehicle rental management system designed to streamline your rental operations.
          This help center will guide you through all features and functionalities of the system.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 w-full">
        {features?.map((feature, index) => {
          const Icon = iconMap[feature.icon] || FileText;
          return (
            <Card key={index} className="p-6 hover:shadow-md transition-shadow h-full">
              <div className="space-y-3 h-full flex flex-col">
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-primary flex-shrink-0" />
                  <h3 className="text-lg font-medium text-left">{feature.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground text-left leading-relaxed flex-grow">
                  {feature.description}
                </p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="w-full space-y-6">
    <div className="space-y-4 max-w-4xl w-full">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-20 w-full" />
    </div>
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 w-full">
      {[1, 2, 3, 4, 5].map((i) => (
        <Card key={i} className="p-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-6 w-32" />
            </div>
            <Skeleton className="h-20 w-full" />
          </div>
        </Card>
      ))}
    </div>
  </div>
);