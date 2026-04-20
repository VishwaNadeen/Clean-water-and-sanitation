import { Routes, Route } from "react-router-dom";
import MainLayout from "./frontend/src/layouts/MainLayout";
import PublicRoutes from "./frontend/src/routes/PublicRoutes";
import AuthRoutes from "./frontend/src/routes/AuthRoutes";
import HomeRoutes from "./frontend/src/routes/HomeRoutes";
import ProfileRoutes from "./frontend/src/routes/ProfileRoutes";
import AdminRoutes from "./frontend/src/routes/AdminRoutes";
import StaffRoutes from "./frontend/src/routes/StaffRoutes";
import MapRoutes from "./frontend/src/routes/MapRoutes";
import IssueRoutes from "./frontend/src/routes/IssueRoutes";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {HomeRoutes}
        {PublicRoutes}
        {AuthRoutes}
        {ProfileRoutes}
        {IssueRoutes}
        {MapRoutes}
      </Route>

      {AdminRoutes}
      {StaffRoutes}
    </Routes>
  );
}