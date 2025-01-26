import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { useDashboardSubscriptions } from "@/hooks/use-dashboard-subscriptions";
import { Skeleton } from "@/components/ui/skeleton";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const CustomDashboard = () => {
  // Use the dashboard subscriptions hook for real-time updates
  useDashboardSubscriptions();

  const { data: activeAgreements, isLoading } = useQuery({
    queryKey: ["active-rent-amounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leases")
        .select(`
          agreement_number,
          rent_amount
        `)
        .eq("status", "active")
        .order("agreement_number");

      if (error) throw error;
      return data;
    },
  });

  const totalRentAmount = activeAgreements?.reduce(
    (sum, item) => sum + (item.rent_amount || 0),
    0
  ) || 0;

  return (
    <div className="space-y-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Active Agreement Rent Amounts</CardTitle>
              <CardDescription>Monthly rent amounts for active lease agreements</CardDescription>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-5 w-5 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Real-time overview of active agreements and their monthly rent amounts</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agreement Number</TableHead>
                <TableHead className="text-right">Monthly Rent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-4 w-[140px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  </TableRow>
                ))
              ) : activeAgreements?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-muted-foreground py-6">
                    No active agreements found
                  </TableCell>
                </TableRow>
              ) : (
                activeAgreements?.map((item) => (
                  <TableRow key={item.agreement_number}>
                    <TableCell className="font-medium">{item.agreement_number}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.rent_amount)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell>Total Monthly Rent</TableCell>
                <TableCell className="text-right font-bold">
                  {isLoading ? (
                    <Skeleton className="h-4 w-[100px] ml-auto" />
                  ) : (
                    formatCurrency(totalRentAmount)
                  )}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};