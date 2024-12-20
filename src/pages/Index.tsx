import { Container } from "@/components/ui/container"
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader"
import { DashboardStats } from "@/components/dashboard/DashboardStats"
import { VehicleStatusChart } from "@/components/dashboard/VehicleStatusChart"
import { DashboardAlerts } from "@/components/dashboard/DashboardAlerts"
import { QuickActions } from "@/components/dashboard/QuickActions"
import { RecentActivity } from "@/components/dashboard/RecentActivity"

export default function Index() {
  return (
    <Container>
      <WelcomeHeader />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardStats />
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <VehicleStatusChart />
        </div>
        <div className="col-span-3">
          <DashboardAlerts />
        </div>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-3">
          <QuickActions />
        </div>
        <div className="col-span-4">
          <RecentActivity />
        </div>
      </div>
    </Container>
  )
}