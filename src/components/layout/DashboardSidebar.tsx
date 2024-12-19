import { NavLink } from "react-router-dom";
import { 
  Users, Car, FileText, Tool, Settings, 
  BarChart, HelpCircle, Scale, Wallet, Code 
} from "lucide-react";

export const DashboardSidebar = () => {
  return (
    <nav className="space-y-2">
      <NavLink
        to="/customers"
        className={({ isActive }) =>
          `flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
          }`
        }
      >
        <Users className="w-5 h-5" />
        <span>Customers</span>
      </NavLink>
      
      <NavLink
        to="/vehicles"
        className={({ isActive }) =>
          `flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
          }`
        }
      >
        <Car className="w-5 h-5" />
        <span>Vehicles</span>
      </NavLink>

      <NavLink
        to="/agreements"
        className={({ isActive }) =>
          `flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
          }`
        }
      >
        <FileText className="w-5 h-5" />
        <span>Agreements</span>
      </NavLink>

      <NavLink
        to="/maintenance"
        className={({ isActive }) =>
          `flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
          }`
        }
      >
        <Tool className="w-5 h-5" />
        <span>Maintenance</span>
      </NavLink>

      <NavLink
        to="/settings"
        className={({ isActive }) =>
          `flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
          }`
        }
      >
        <Settings className="w-5 h-5" />
        <span>Settings</span>
      </NavLink>

      <NavLink
        to="/reports"
        className={({ isActive }) =>
          `flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
          }`
        }
      >
        <BarChart className="w-5 h-5" />
        <span>Reports</span>
      </NavLink>

      <NavLink
        to="/help"
        className={({ isActive }) =>
          `flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
          }`
        }
      >
        <HelpCircle className="w-5 h-5" />
        <span>Help</span>
      </NavLink>

      <NavLink
        to="/legal"
        className={({ isActive }) =>
          `flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
          }`
        }
      >
        <Scale className="w-5 h-5" />
        <span>Legal</span>
      </NavLink>

      <NavLink
        to="/finance"
        className={({ isActive }) =>
          `flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
          }`
        }
      >
        <Wallet className="w-5 h-5" />
        <span>Finance</span>
      </NavLink>

      <NavLink
        to="/code-analysis"
        className={({ isActive }) =>
          `flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
          }`
        }
      >
        <Code className="w-5 h-5" />
        <span>Code Analysis</span>
      </NavLink>
    </nav>
  );
};
