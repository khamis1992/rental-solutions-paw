import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaymentHistoryAnalysis } from "./profile/PaymentHistoryAnalysis";
import { RentDueManagement } from "./profile/RentDueManagement";
import { TrafficFinesSummary } from "./profile/TrafficFinesSummary";
import { CredibilityScore } from "./profile/CredibilityScore";
import { CreditAssessment } from "./profile/CreditAssessment";

interface CustomerProfileViewProps {
  customerId: string;
}

export const CustomerProfileView = ({ customerId }: CustomerProfileViewProps) => {
  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["customer", customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", customerId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  if (isLoadingProfile) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{profile?.full_name}</h1>
        <Badge variant={profile?.role === "customer" ? "secondary" : "default"}>
          {profile?.role}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CredibilityScore customerId={customerId} />
        <CreditAssessment customerId={customerId} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RentDueManagement customerId={customerId} />
      </div>

      <Tabs defaultValue="payments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
          <TabsTrigger value="fines">Traffic Fines</TabsTrigger>
        </TabsList>

        <TabsContent value="payments">
          <PaymentHistoryAnalysis customerId={customerId} />
        </TabsContent>

        <TabsContent value="fines">
          <TrafficFinesSummary customerId={customerId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};