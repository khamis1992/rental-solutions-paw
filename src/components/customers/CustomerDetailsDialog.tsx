import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PaymentHistoryAnalysis } from "./profile/PaymentHistoryAnalysis";
import { RentDueManagement } from "./profile/RentDueManagement";
import { TrafficFinesSummary } from "./profile/TrafficFinesSummary";
import { CredibilityScore } from "./profile/CredibilityScore";

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
  const { data: profile, isLoading } = useQuery({
    queryKey: ["customer-details", customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", customerId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!customerId && open,
  });

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customer Profile</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div>Loading customer details...</div>
        ) : profile ? (
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Full Name</Label>
                    <p className="text-lg font-medium">{profile.full_name}</p>
                  </div>
                  <div>
                    <Label>Phone Number</Label>
                    <p className="text-lg font-medium">{profile.phone_number}</p>
                  </div>
                  <div className="col-span-2">
                    <Label>Address</Label>
                    <p>{profile.address}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="credibility" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="credibility">Credibility Score</TabsTrigger>
                <TabsTrigger value="payments">Payment History</TabsTrigger>
                <TabsTrigger value="rentdue">Rent Due</TabsTrigger>
                <TabsTrigger value="fines">Traffic Fines</TabsTrigger>
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
            </Tabs>
          </div>
        ) : (
          <div>Customer not found</div>
        )}
      </DialogContent>
    </Dialog>
  );
};