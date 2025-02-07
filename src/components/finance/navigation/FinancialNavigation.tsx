import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { 
  BarChart3, 
  CreditCard, 
  Database,
  Car,
  Brain,
  ChevronRight
} from "lucide-react";

const navigationItems = [
  {
    title: "Dashboard",
    path: "/finance",
    icon: BarChart3,
    description: "Overview of financial metrics"
  },
  {
    title: "Payments",
    path: "/finance/payments",
    icon: CreditCard,
    description: "Manage payment transactions"
  },
  {
    title: "Raw Data",
    path: "/finance/raw-data",
    icon: Database,
    description: "View and analyze raw financial data"
  },
  {
    title: "Car Installments",
    path: "/finance/car-installments",
    icon: Car,
    description: "Track vehicle installment payments"
  },
  {
    title: "Virtual CFO",
    path: "/finance/virtual-cfo",
    icon: Brain,
    description: "AI-powered financial insights"
  }
];

export const FinancialNavigation = () => {
  const location = useLocation();
  const currentPath = location.pathname.endsWith('/finance') ? '/finance' : location.pathname;

  return (
    <nav className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {navigationItems.map((item) => {
          const isActive = currentPath === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "relative group p-4 rounded-lg border transition-all duration-300",
                "hover:shadow-lg hover:border-primary/50",
                "bg-gradient-to-br from-background to-background/50",
                isActive && "border-primary shadow-md bg-primary/5"
              )}
            >
              <div className="flex items-start space-x-4">
                <div className={cn(
                  "p-2 rounded-md transition-colors",
                  isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
                  "group-hover:bg-primary/10 group-hover:text-primary"
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h3 className={cn(
                    "font-medium transition-colors",
                    isActive ? "text-primary" : "text-foreground",
                    "group-hover:text-primary"
                  )}>
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </div>
              <ChevronRight className={cn(
                "absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-all duration-300",
                "opacity-0 -translate-x-2",
                "group-hover:opacity-100 group-hover:translate-x-0",
                isActive ? "text-primary" : "text-muted-foreground"
              )} />
            </Link>
          );
        })}
      </div>
    </nav>
  );
};