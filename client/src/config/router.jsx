import { createBrowserRouter } from "react-router-dom";
import { ROUTES } from "../constants/routes";

const router = createBrowserRouter([
  {
    path: ROUTES.home,
    element: <>Hello</>,
  },
]);

export { router };
