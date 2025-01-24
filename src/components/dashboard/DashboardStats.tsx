interface DashboardStatsProps {
  stats?: {
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
    <div className="grid grid-cols-1 gap-4">
      <div className="bg-white shadow rounded-lg p-4">
        <h3 className="text-lg font-semibold">Total Vehicles</h3>
        <p className="text-2xl">{stats?.totalVehicles ?? 0}</p>
      </div>
      <div className="bg-white shadow rounded-lg p-4">
        <h3 className="text-lg font-semibold">Available Vehicles</h3>
        <p className="text-2xl">{stats?.availableVehicles ?? 0}</p>
      </div>
      <div className="bg-white shadow rounded-lg p-4">
        <h3 className="text-lg font-semibold">Rented Vehicles</h3>
        <p className="text-2xl">{stats?.rentedVehicles ?? 0}</p>
      </div>
      <div className="bg-white shadow rounded-lg p-4">
        <h3 className="text-lg font-semibold">Maintenance Vehicles</h3>
        <p className="text-2xl">{stats?.maintenanceVehicles ?? 0}</p>
      </div>
      <div className="bg-white shadow rounded-lg p-4">
        <h3 className="text-lg font-semibold">Total Customers</h3>
        <p className="text-2xl">{stats?.totalCustomers ?? 0}</p>
      </div>
      <div className="bg-white shadow rounded-lg p-4">
        <h3 className="text-lg font-semibold">Active Rentals</h3>
        <p className="text-2xl">{stats?.activeRentals ?? 0}</p>
      </div>
      <div className="bg-white shadow rounded-lg p-4">
        <h3 className="text-lg font-semibold">Monthly Revenue</h3>
        <p className="text-2xl">{stats?.monthlyRevenue ?? 0} QAR</p>
      </div>
    </div>
  );
};
