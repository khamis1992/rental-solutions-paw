
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaymentHistoryAnalysis } from "./profile/PaymentHistoryAnalysis";
import { RentDueManagement } from "./profile/RentDueManagement";
import { TrafficFinesSummary } from "./profile/TrafficFinesSummary";
import { CredibilityScore } from "./profile/CredibilityScore";
import { CustomerNotes } from "./profile/CustomerNotes";
import { CustomerDocuments } from "../agreements/CustomerDocuments";
import { AgreementsHistory } from "./profile/AgreementsHistory";
import { CustomerStatusManager } from "./profile/CustomerStatusManager";
import { User, Mail, Phone, MapPin, Receipt, Calendar, AlertTriangle, FileText, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CustomerProfileViewProps {
  customerId: string;
}

export const CustomerProfileView = ({ customerId }: CustomerProfileViewProps) => {
  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["customer", customerId],
    queryFn: async () => {
      console.log("Fetching customer profile for ID:", customerId);
      
      const { data, error } = await supabase
        .from("profiles")
        .select()
        .eq('id', customerId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching customer profile:", error);
        throw error;
      }

      if (!data) {
        throw new Error("Customer not found");
      }

      return data;
    },
    enabled: !!customerId,
  });

  if (isLoadingProfile) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <h1 className="text-3xl font-bold">{profile?.full_name}</h1>
                  </div>
                  <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-6 sm:space-y-0 text-muted-foreground">
                    <Tooltip>
                      <TooltipTrigger className="flex items-center gap-2 hover:text-foreground transition-colors">
                        <Mail className="h-4 w-4" />
                        <span>{profile?.email}</span>
                      </TooltipTrigger>
                      <TooltipContent>Email Address</TooltipContent>
                    </Tooltip>
                    <Separator className="hidden sm:block" orientation="vertical" />
                    <Tooltip>
                      <TooltipTrigger className="flex items-center gap-2 hover:text-foreground transition-colors">
                        <Phone className="h-4 w-4" />
                        <span>{profile?.phone_number}</span>
                      </TooltipTrigger>
                      <TooltipContent>Phone Number</TooltipContent>
                    </Tooltip>
                    {profile?.address && (
                      <>
                        <Separator className="hidden sm:block" orientation="vertical" />
                        <Tooltip>
                          <TooltipTrigger className="flex items-center gap-2 hover:text-foreground transition-colors">
                            <MapPin className="h-4 w-4" />
                            <span>{profile.address}</span>
                          </TooltipTrigger>
                          <TooltipContent>Address</TooltipContent>
                        </Tooltip>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <CustomerStatusManager profile={profile} />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CredibilityScore customerId={customerId} />
        </div>

        <CustomerNotes customerId={customerId} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <RentDueManagement customerId={customerId} />
          <CustomerDocuments customerId={customerId} />
        </div>

        <Tabs defaultValue="payment_history" className="space-y-4">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="payment_history" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Payment History
            </TabsTrigger>
            <TabsTrigger value="rent_due" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Rent Due
            </TabsTrigger>
            <TabsTrigger value="traffic_fines" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Traffic Fines
            </TabsTrigger>
            <TabsTrigger value="agreements_history" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Agreements History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="payment_history" className="animate-fade-in">
            <PaymentHistoryAnalysis customerId={customerId} />
          </TabsContent>

          <TabsContent value="rent_due" className="animate-fade-in">
            <RentDueManagement customerId={customerId} />
          </TabsContent>

          <TabsContent value="traffic_fines" className="animate-fade-in">
            <TrafficFinesSummary customerId={customerId} />
          </TabsContent>

          <TabsContent value="agreements_history" className="animate-fade-in">
            <AgreementsHistory customerId={customerId} />
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
};
