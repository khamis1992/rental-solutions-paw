import { useAuth } from "@/hooks/use-auth";
import { ProfileManagement } from "./ProfileManagement";
import { PaymentHistory } from "./PaymentHistory";
import { CustomerFeedback } from "./CustomerFeedback";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

export const CustomerPortal = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <Card className="p-6">
        <div className="text-center">
          Please log in to access your portal
        </div>
      </Card>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileManagement />
        </TabsContent>

        <TabsContent value="payments">
          <PaymentHistory customerId={user.id} />
        </TabsContent>

        <TabsContent value="feedback">
          <CustomerFeedback customerId={user.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};