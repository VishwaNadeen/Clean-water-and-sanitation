import { Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import PublicRoutes from "./PublicRoutes";
import AuthRoutes from "./AuthRoutes";
import HomeRoutes from "./HomeRoutes";
import ProfileRoutes from "./ProfileRoutes";
import AdminRoutes from "./AdminRoutes";
import StaffRoutes from "./StaffRoutes";
import MapRoutes from "./MapRoutes";
import IssueRoutes from "./IssueRoutes";

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