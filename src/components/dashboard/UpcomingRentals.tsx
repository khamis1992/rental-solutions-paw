import { CalendarClock, CarFront } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const UpcomingRentals = () => {
  const { data: upcomingRentals = [] } = useQuery({
    queryKey: ["upcoming-rentals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leases")
        .select(`
          *,
          vehicles (make, model, year),
          profiles (full_name)
        `)
        .gte("start_date", new Date().toISOString())
        .order("start_date")
        .limit(5);

      if (error) throw error;
      return data;
    },
  });

  return (
    <Card className="lg:col-span-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-muted-foreground" />
          Upcoming Rentals
        </CardTitle>
      </CardHeader>
      <CardContent>
        {upcomingRentals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <CarFront className="h-12 w-12 mb-4" />
            <p>No upcoming rentals scheduled</p>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingRentals.map((rental) => (
              <div key={rental.id} className="flex items-center gap-4 p-4 rounded-lg border hover:shadow-md transition-shadow">
                <div className="h-12 w-12 rounded-full flex items-center justify-center bg-blue-50 text-blue-500">
                  <CarFront className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium">
                    {rental.vehicles.year} {rental.vehicles.make} {rental.vehicles.model}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Reserved by {rental.profiles.full_name}
                  </p>
                </div>
                <Badge variant="secondary" className="whitespace-nowrap">
                  {new Date(rental.start_date).toLocaleDateString()}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};