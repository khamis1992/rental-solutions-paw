import { Card } from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { DashboardStats as DashboardStatsType } from "@/types/dashboard.types";
import { formatCurrency } from "@/lib/utils";

interface DashboardStatsProps {
  stats: DashboardStatsType;
}

export const DashboardStats = ({ stats }: DashboardStatsProps) => {
  const { t } = useTranslation();

  const statItems = [
    {
      label: t('dashboard.totalVehicles'),
      value: stats.total_vehicles,
    },
    {
      label: t('dashboard.availableVehicles'),
      value: stats.available_vehicles,
    },
    {
      label: t('dashboard.rentedVehicles'),
      value: stats.rented_vehicles,
    },
    {
      label: t('dashboard.maintenanceVehicles'),
      value: stats.maintenance_vehicles,
    },
    {
      label: t('dashboard.totalCustomers'),
      value: stats.total_customers,
    },
    {
      label: t('dashboard.activeRentals'),
      value: stats.active_rentals,
    },
    {
      label: t('dashboard.monthlyRevenue'),
      value: formatCurrency(stats.monthly_revenue),
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statItems.map((item, index) => (
        <Card key={index} className="p-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              {item.label}
            </p>
            <p className="text-2xl font-bold">{item.value}</p>
          </div>
        </Card>
      ))}
    </div>
  );
};