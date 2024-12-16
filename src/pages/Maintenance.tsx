import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { MaintenanceList } from "@/components/maintenance/MaintenanceList";
import { MaintenanceStats } from "@/components/maintenance/MaintenanceStats";
import { MaintenanceFilters } from "@/components/maintenance/MaintenanceFilters";
import { MaintenanceCalendar } from "@/components/maintenance/MaintenanceCalendar";
import { JobCard } from "@/components/maintenance/JobCard";
import { Button } from "@/components/ui/button";
import { Plus, ListFilter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Maintenance = () => {
  const [filters, setFilters] = useState({
    status: "all",
    serviceType: "",
    dateRange: "",
  });

  const { data: maintenanceRecords, isLoading } = useQuery({
    queryKey: ["maintenance", filters],
    queryFn: async () => {
      let query = supabase
        .from("maintenance")
        .select("*, vehicles(make, model, year)");

      if (filters.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }
      if (filters.serviceType) {
        query = query.ilike("service_type", `%${filters.serviceType}%`);
      }

      const { data, error } = await query;
      
      if (error) {
        toast.error("Failed to fetch maintenance records");
        throw error;
      }
      
      return data;
    },
  });

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      toast.info(`Selected date: ${date.toLocaleDateString()}`);
    }
  };

  return (
    <>
      <DashboardSidebar />
      <div className="flex-1">
        <DashboardHeader />
        <main className="container py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Maintenance</h1>
            <div className="flex gap-2">
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Create Job Card
              </Button>
            </div>
          </div>
          
          <MaintenanceStats records={maintenanceRecords || []} isLoading={isLoading} />
          
          <Tabs defaultValue="list" className="mt-6">
            <TabsList>
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
              <TabsTrigger value="jobs">Job Cards</TabsTrigger>
            </TabsList>
            
            <TabsContent value="list">
              <MaintenanceFilters filters={filters} setFilters={setFilters} />
              <MaintenanceList records={maintenanceRecords || []} isLoading={isLoading} />
            </TabsContent>
            
            <TabsContent value="calendar">
              <div className="grid md:grid-cols-[300px,1fr] gap-6">
                <MaintenanceCalendar
                  tasks={[]}
                  onDateSelect={handleDateSelect}
                />
                <div className="space-y-4">
                  {maintenanceRecords?.map((record) => (
                    <JobCard
                      key={record.id}
                      id={record.id}
                      vehicleId={record.vehicle_id}
                      serviceType={record.service_type}
                      priority="medium"
                      status={record.status}
                      scheduledDate={record.scheduled_date}
                      description={record.description || ""}
                      assignedTo={record.performed_by}
                      estimatedHours={4}
                    />
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="jobs">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {maintenanceRecords?.map((record) => (
                  <JobCard
                    key={record.id}
                    id={record.id}
                    vehicleId={record.vehicle_id}
                    serviceType={record.service_type}
                    priority="medium"
                    status={record.status}
                    scheduledDate={record.scheduled_date}
                    description={record.description || ""}
                    assignedTo={record.performed_by}
                    estimatedHours={4}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  );
};

export default Maintenance;