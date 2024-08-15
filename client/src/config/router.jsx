import { createBrowserRouter } from "react-router-dom";
import { ROUTES } from "../constants/routes";
import AdminLayout from "../layouts/adminLayout";
import LandingPage from "../pages/landing";
import AuthPage from "@/pages/auth";
import DashboardLanding from "@/pages/dashboard";
import History from "@/pages/ir-components/history";

const router = createBrowserRouter([
  {
    path: ROUTES.home,
    element: <LandingPage />,
  },
  {
    path: ROUTES.setup,
    element: <>Setup</>,
  },
  {
    path: `${ROUTES.auth}/:view?`,
    element: <AuthPage />,
  },
  {
    path: ROUTES.dashboard._base,
    element: <AdminLayout />,
    children: [
      {
        path: ROUTES.dashboard.dashboard,
        element: <DashboardLanding />
      },
      {
        path: ROUTES.dashboard.fileManager,
        element: <>file Manager</>
      },
      {
        path: ROUTES.dashboard.train,
        element: <>Train</>
      },
      {
        path: ROUTES.dashboard.history,
        element: <History />
      },
    ]
  }

]);

export { router };
