import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PaymentHistoryAnalysis } from "./profile/PaymentHistoryAnalysis";
import { RentDueManagement } from "./profile/RentDueManagement";
import { TrafficFinesSummary } from "./profile/TrafficFinesSummary";
import { CredibilityScore } from "./profile/CredibilityScore";
import { CustomerDocumentAnalysis } from "./analysis/CustomerDocumentAnalysis";
import { useToast } from "@/components/ui/use-toast";
import { CustomerBasicInfo } from "./profile/CustomerBasicInfo";
import { CustomerDocumentSection } from "./profile/CustomerDocumentSection";

interface CustomerDetailsDialogProps {
  customerId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CustomerDetailsDialog = ({
  customerId,
  open,
  onOpenChange,
}: CustomerDetailsDialogProps) => {
  const { toast } = useToast();
  
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ["customer-details", customerId],
    queryFn: async () => {
      console.log("Fetching customer details for ID:", customerId);
      
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", customerId)
          .maybeSingle();

        if (error) {
          console.error("Database error:", error);
          throw error;
        }

        if (!data) {
          console.log("No profile found for ID:", customerId);
          return null;
        }

        console.log("Successfully fetched profile:", data);
        return data;
      } catch (error: any) {
        console.error("Error in profile fetch:", error);
        toast({
          title: "Error",
          description: "Failed to load customer details: " + error.message,
          variant: "destructive",
        });
        throw error;
      }
    },
    enabled: !!customerId && open,
    retry: 1,
  });

  if (!open) return null;

  if (error) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error Loading Profile</DialogTitle>
          </DialogHeader>
          <p className="text-red-500">Failed to load customer details. Please try again later.</p>
        </DialogContent>
      </Dialog>
    );
  }

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Loading...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!profile) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Customer Not Found</DialogTitle>
          </DialogHeader>
          <p>The requested customer profile could not be found.</p>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customer Profile</DialogTitle>
        </DialogHeader>

        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4">
              <CustomerBasicInfo profile={profile} />
              <CustomerDocumentSection profile={profile} />
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="credibility" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="credibility">Credibility Score</TabsTrigger>
            <TabsTrigger value="payments">Payment History</TabsTrigger>
            <TabsTrigger value="rentdue">Rent Due</TabsTrigger>
            <TabsTrigger value="fines">Traffic Fines</TabsTrigger>
            <TabsTrigger value="documents">Document Analysis</TabsTrigger>
          </TabsList>
          <TabsContent value="credibility">
            <CredibilityScore customerId={customerId} />
          </TabsContent>
          <TabsContent value="payments">
            <PaymentHistoryAnalysis customerId={customerId} />
          </TabsContent>
          <TabsContent value="rentdue">
            <RentDueManagement customerId={customerId} />
          </TabsContent>
          <TabsContent value="fines">
            <TrafficFinesSummary customerId={customerId} />
          </TabsContent>
          <TabsContent value="documents">
            <CustomerDocumentAnalysis customerId={customerId} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};