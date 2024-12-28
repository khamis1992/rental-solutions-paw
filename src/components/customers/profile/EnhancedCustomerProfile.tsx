import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { CustomerBasicInfo } from "./CustomerBasicInfo";
import { CustomerDocumentSection } from "./CustomerDocumentSection";
import { TrafficFinesSummary } from "./TrafficFinesSummary";
import { PaymentHistoryAnalysis } from "./PaymentHistoryAnalysis";
import { RentDueManagement } from "./RentDueManagement";
import { CustomerNotes } from "./CustomerNotes";
import { CredibilityScore } from "./CredibilityScore";
import { CreditAssessment } from "./CreditAssessment";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface EnhancedCustomerProfileProps {
  customerId: string;
}

export function EnhancedCustomerProfile({ customerId }: EnhancedCustomerProfileProps) {
  const { data: profile, isLoading } = useQuery({
    queryKey: ["customer-profile", customerId],
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return <div>Customer not found</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-4">
            <CustomerBasicInfo profile={profile} />
            <CustomerDocumentSection profile={profile} />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CredibilityScore customerId={customerId} />
        <CreditAssessment customerId={customerId} />
      </div>

      <CustomerNotes customerId={customerId} />

      <Tabs defaultValue="payments" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="payments">Payment History</TabsTrigger>
          <TabsTrigger value="rentdue">Rent Due</TabsTrigger>
          <TabsTrigger value="fines">Traffic Fines</TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="mt-4">
          <PaymentHistoryAnalysis customerId={customerId} />
        </TabsContent>

        <TabsContent value="rentdue" className="mt-4">
          <RentDueManagement customerId={customerId} />
        </TabsContent>

        <TabsContent value="fines" className="mt-4">
          <TrafficFinesSummary customerId={customerId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}