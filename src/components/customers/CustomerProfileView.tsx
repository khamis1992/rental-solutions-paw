import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";
import { User, IdCard, CreditCard, FileText, Calendar } from "lucide-react";

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

  const { data: leases, isLoading: isLoadingLeases } = useQuery({
    queryKey: ["customer-leases", customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leases")
        .select(`
          *,
          vehicle:vehicles(make, model, year),
          payments(amount, status, payment_date)
        `)
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoadingProfile || isLoadingLeases) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const totalPayments = leases?.reduce((sum, lease) => {
    const leasePayments = lease.payments?.reduce(
      (leaseSum: number, payment: any) =>
        payment.status === "completed" ? leaseSum + payment.amount : leaseSum,
      0
    );
    return sum + (leasePayments || 0);
  }, 0);

  const outstandingBalance = leases?.reduce((sum, lease) => {
    const leasePayments = lease.payments?.reduce(
      (leaseSum: number, payment: any) =>
        payment.status === "pending" ? leaseSum + payment.amount : leaseSum,
      0
    );
    return sum + (leasePayments || 0);
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{profile?.full_name}</h1>
        <Badge variant={profile?.role === "customer" ? "secondary" : "default"}>
          {profile?.role}
        </Badge>
      </div>

      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList>
          <TabsTrigger value="personal">Personal Information</TabsTrigger>
          <TabsTrigger value="license">Driver's License</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="leases">Rental History</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="font-medium">Phone:</span> {profile?.phone_number}
              </div>
              <div>
                <span className="font-medium">Address:</span> {profile?.address}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="license" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IdCard className="h-5 w-5" />
                Driver's License Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <span className="font-medium">License Number:</span>{" "}
                {profile?.driver_license}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Total Payments:</span>{" "}
                    {formatCurrency(totalPayments || 0)}
                  </div>
                  <div>
                    <span className="font-medium">Outstanding Balance:</span>{" "}
                    {formatCurrency(outstandingBalance || 0)}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Lease Terms
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <span className="font-medium">Active Leases:</span>{" "}
                  {leases?.filter((lease) => lease.status === "active").length}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="leases" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Rental History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leases?.map((lease) => (
                  <div
                    key={lease.id}
                    className="flex items-center justify-between border-b pb-2"
                  >
                    <div>
                      <div className="font-medium">
                        {lease.vehicle.year} {lease.vehicle.make}{" "}
                        {lease.vehicle.model}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(lease.start_date).toLocaleDateString()} -{" "}
                        {new Date(lease.end_date).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge variant={lease.status === "active" ? "default" : "secondary"}>
                      {lease.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};