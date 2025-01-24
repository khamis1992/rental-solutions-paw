import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface DashboardStatsProps {
  stats: {
    totalVehicles: number;
    availableVehicles: number;
    rentedVehicles: number;
    maintenanceVehicles: number;
    totalCustomers: number;
    activeRentals: number;
    monthlyRevenue: number;
  }
}

export const DashboardStats = ({ stats }: DashboardStatsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="p-4">
        <h3 className="text-sm font-medium text-muted-foreground">Total Vehicles</h3>
        <p className="text-2xl font-bold">{stats.totalVehicles}</p>
      </Card>
      
      <Card className="p-4">
        <h3 className="text-sm font-medium text-muted-foreground">Available Vehicles</h3>
        <p className="text-2xl font-bold">{stats.availableVehicles}</p>
      </Card>
      
      <Card className="p-4">
        <h3 className="text-sm font-medium text-muted-foreground">Active Rentals</h3>
        <p className="text-2xl font-bold">{stats.activeRentals}</p>
      </Card>
      
      <Card className="p-4">
        <h3 className="text-sm font-medium text-muted-foreground">Monthly Revenue</h3>
        <p className="text-2xl font-bold">{formatCurrency(stats.monthlyRevenue)}</p>
      </Card>
    </div>
  );
};