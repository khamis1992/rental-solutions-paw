import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AgreementDetailsTab } from "./details/AgreementDetailsTab";
import { AgreementPaymentsTab } from "./details/AgreementPaymentsTab";
import { AgreementDocumentsTab } from "./details/AgreementDocumentsTab";
import { AgreementHistoryTab } from "./details/AgreementHistoryTab";

export const AgreementDetailsDialog = ({
  agreementId,
  open,
  onOpenChange,
}: {
  agreementId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const [agreement, setAgreement] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    const fetchAgreement = async () => {
      if (!agreementId) return;

      try {
        setIsLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from("leases")
          .select(`
            *,
            customer:profiles (
              id,
              full_name,
              email,
              phone_number
            ),
            vehicle:vehicles (
              id,
              make,
              model,
              year,
              license_plate,
              vin
            )
          `)
          .eq("id", agreementId)
          .maybeSingle();

        if (fetchError) {
          console.error("Error fetching agreement:", fetchError);
          throw fetchError;
        }

        if (!data) {
          console.log("No agreement found with ID:", agreementId);
          toast.error("Agreement not found");
          return;
        }

        console.log("Fetched agreement:", data);
        setAgreement(data);
      } catch (err) {
        console.error("Error in fetchAgreement:", err);
        setError(err as Error);
        toast.error("Failed to load agreement details");
      } finally {
        setIsLoading(false);
      }
    };

    if (open) {
      fetchAgreement();
    }
  }, [agreementId, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agreement Details</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center p-4">
            <span>Loading agreement details...</span>
          </div>
        ) : error ? (
          <div className="text-red-500 p-4">
            Error loading agreement details: {error.message}
          </div>
        ) : !agreement ? (
          <div className="text-gray-500 p-4">No agreement found</div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <AgreementDetailsTab agreement={agreement} />
            </TabsContent>

            <TabsContent value="payments">
              <AgreementPaymentsTab agreementId={agreement.id} />
            </TabsContent>

            <TabsContent value="documents">
              <AgreementDocumentsTab agreementId={agreement.id} />
            </TabsContent>

            <TabsContent value="history">
              <AgreementHistoryTab agreementId={agreement.id} />
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};