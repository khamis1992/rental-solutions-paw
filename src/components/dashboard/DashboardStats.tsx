
import { Car, Users, FileText, DollarSign, ChevronUp, ChevronDown, ArrowRight, Wrench, ChevronLeft, ChevronRight } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { formatCurrency } from "@/lib/utils";
import { useRef, useState, useEffect } from "react";

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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollIndicators, setShowScrollIndicators] = useState(true);
  
  const calculatePercentage = (value: number, total: number) => {
    if (total === 0) return 0;
    return ((value / total) * 100).toFixed(1);
  };

  const availablePercentage = calculatePercentage(stats.availableVehicles, stats.totalVehicles);
  const rentedPercentage = calculatePercentage(stats.rentedVehicles, stats.totalVehicles);
  const maintenancePercentage = calculatePercentage(stats.maintenanceVehicles, stats.totalVehicles);

  // Hide scroll indicators after user has scrolled
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setShowScrollIndicators(false);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative">
      {/* Scroll Container */}
      <div 
        ref={scrollContainerRef}
        className="w-full overflow-x-auto pb-6 -mx-4 px-4 
                   snap-x snap-mandatory scroll-smooth touch-pan-x 
                   hide-scrollbar relative"
      >
        {/* Stats Grid/Flex Container */}
        <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 min-w-full sm:min-w-0">
          <StatsCard
            title="Total Fleet"
            value={stats.totalVehicles.toString()}
            icon={Car}
            description={
              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <ChevronUp className="h-4 w-4 animate-bounce" />
                <span>{availablePercentage}% available</span>
              </div>
            }
            iconClassName="text-blue-500 dark:text-blue-400"
          />

          <StatsCard
            title="Active Rentals"
            value={stats.activeRentals.toString()}
            icon={FileText}
            description={
              <div className="flex items-center gap-1 text-primary/80">
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                <span>{rentedPercentage}% of fleet</span>
              </div>
            }
            iconClassName="text-purple-500 dark:text-purple-400"
          />

          <StatsCard
            title="Total Customers"
            value={stats.totalCustomers.toString()}
            icon={Users}
            description={
              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <ChevronUp className="h-4 w-4 animate-bounce" />
                <span>Active accounts</span>
              </div>
            }
            iconClassName="text-emerald-500 dark:text-emerald-400"
          />

          <StatsCard
            title="Monthly Revenue"
            value={formatCurrency(stats.monthlyRevenue)}
            icon={DollarSign}
            description={
              <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <Wrench className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                <span>{maintenancePercentage}% in maintenance</span>
              </div>
            }
            iconClassName="text-amber-500 dark:text-amber-400"
          />
        </div>
      </div>

      {/* Scroll Indicators */}
      {showScrollIndicators && (
        <>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 hidden sm:hidden">
            <ChevronLeft className="h-6 w-6 text-muted-foreground/50" />
          </div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden sm:hidden 
                         animate-pulse pointer-events-none">
            <ChevronRight className="h-6 w-6 text-muted-foreground/50" />
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardStats;
