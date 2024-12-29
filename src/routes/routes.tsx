import { createBrowserRouter } from "react-router-dom";
import Finance from "@/pages/Finance";
import Dashboard from "@/pages/Dashboard";
import Vehicles from "@/pages/Vehicles";
import Customers from "@/pages/Customers";
import Agreements from "@/pages/Agreements";
import Maintenance from "@/pages/Maintenance";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import RemainingAmount from "@/pages/RemainingAmount";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Login } from "@/pages/auth/Login";
import { Register } from "@/pages/auth/Register";
import { ForgotPassword } from "@/pages/auth/ForgotPassword";
import { ResetPassword } from "@/pages/auth/ResetPassword";
import { VerifyEmail } from "@/pages/auth/VerifyEmail";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Dashboard />,
  },
  {
    path: "/finance",
    element: <Finance />,
  },
  {
    path: "/vehicles",
    element: <Vehicles />,
  },
  {
    path: "/customers",
    element: <Customers />,
  },
  {
    path: "/agreements",
    element: <Agreements />,
  },
  {
    path: "/maintenance",
    element: <Maintenance />,
  },
  {
    path: "/reports",
    element: <Reports />,
  },
  {
    path: "/settings",
    element: <Settings />,
  },
  {
    path: "/remaining-amount",
    element: <RemainingAmount />,
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/register",
        element: <Register />,
      },
      {
        path: "/forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "/reset-password",
        element: <ResetPassword />,
      },
      {
        path: "/verify-email",
        element: <VerifyEmail />,
      },
    ],
  },
]);