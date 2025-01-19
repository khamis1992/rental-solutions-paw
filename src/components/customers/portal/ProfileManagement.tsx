import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

export const ProfileManagement = () => {
  const { user } = useAuth();

  const { data: agreement, isLoading } = useQuery({
    queryKey: ['customer-agreement', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leases')
        .select(`
          *,
          customer:customer_id (
            id,
            full_name,
            phone_number,
            email,
            address,
            nationality
          )
        `)
        .eq('customer_id', user?.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!agreement?.customer) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            No profile information found
          </p>
        </CardContent>
      </Card>
    );
  }

  const customer = agreement.customer;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Full Name</div>
            <div className="font-medium">{customer.full_name || 'N/A'}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Phone Number</div>
            <div className="font-medium">{customer.phone_number || 'N/A'}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Email</div>
            <div className="font-medium">{customer.email || 'N/A'}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Nationality</div>
            <div className="font-medium">{customer.nationality || 'N/A'}</div>
          </div>
          <div className="col-span-2">
            <div className="text-sm text-muted-foreground">Address</div>
            <div className="font-medium">{customer.address || 'N/A'}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};