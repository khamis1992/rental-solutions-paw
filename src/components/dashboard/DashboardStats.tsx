import { useTranslation } from 'react-i18next';
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { DashboardStats } from "@/types/dashboard.types";

interface DashboardStatsProps {
  stats: DashboardStats;
}

export const DashboardStats = ({ stats }: DashboardStatsProps) => {
  const { t } = useTranslation();

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardContent className="p-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{t('dashboard.totalVehicles')}</p>
            <p className="text-2xl font-bold">{stats.total_vehicles}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{t('dashboard.availableVehicles')}</p>
            <p className="text-2xl font-bold">{stats.available_vehicles}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{t('dashboard.activeRentals')}</p>
            <p className="text-2xl font-bold">{stats.active_rentals}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{t('dashboard.monthlyRevenue')}</p>
            <p className="text-2xl font-bold">{formatCurrency(stats.monthly_revenue)}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};