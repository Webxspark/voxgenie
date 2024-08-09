import { createBrowserRouter } from "react-router-dom";
import { ROUTES } from "../constants/routes";
import AdminLayout from "../layouts/adminLayout";

const router = createBrowserRouter([
  {
    path: ROUTES.home,
    element: <>Landing</>,
  },
  {
    path: ROUTES.setup,
    element: <>Setup</>,
  },
  {
    path: ROUTES.dashboard._base,
    element: <AdminLayout />,
    children: [
      {
        path: ROUTES.dashboard._base,
        element: <>Dashboard</>
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
        element: <>History</>
      },
    ]
  }

]);

export { router };
