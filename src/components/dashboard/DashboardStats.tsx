import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardStatsProps {
  stats: {
    totalVehicles: number;
    availableVehicles: number;
    rentedVehicles: number;
    maintenanceVehicles: number;
    totalCustomers: number;
    activeRentals: number;
    monthlyRevenue: number;
  };
}

export const DashboardStats = ({ stats }: DashboardStatsProps) => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Total Vehicles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalVehicles}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Available Vehicles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.availableVehicles}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Rented Vehicles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.rentedVehicles}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Vehicles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.maintenanceVehicles}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Total Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalCustomers}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Active Rentals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeRentals}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.monthlyRevenue} QAR</div>
        </CardContent>
      </Card>
    </div>
  );
};
