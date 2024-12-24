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
import { CustomerNotes } from "./profile/CustomerNotes";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { toast } from "sonner";

interface CustomerProfileViewProps {
  customerId: string;
}

export const CustomerProfileView = ({ customerId }: CustomerProfileViewProps) => {
  const { session } = useSessionContext();

  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["customer", customerId],
    queryFn: async () => {
      if (!session) {
        throw new Error("No authenticated session");
      }

      console.log("Fetching profile for user:", customerId);
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", customerId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load customer profile");
        throw error;
      }
      
      console.log("Profile data:", data);
      return data;
    },
    enabled: !!customerId && !!session
  });

  if (!session) {
    return <div>Please log in to view customer profiles</div>;
  }

  if (isLoadingProfile) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!profile) {
    return <div>Customer not found</div>;
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

      <CustomerNotes customerId={customerId} />

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