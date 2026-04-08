import { Route, Routes } from "react-router-dom";
import PublicRoutes from "./PublicRoutes";
import AuthRoutes from "./AuthRoutes";
import HomeRoutes from "./HomeRoutes";
import ProfileRoutes from "./ProfileRoutes";
import StaffManagementRoutes from "./StaffManagementRoutes";
import NotFound from "../pages/NotFound";

export default function AppRoutes() {
  return (
    <Routes>
      {HomeRoutes}
      {PublicRoutes}
      {AuthRoutes}
      {ProfileRoutes}
      {StaffManagementRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
