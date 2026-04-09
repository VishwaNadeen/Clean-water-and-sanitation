import { Routes } from "react-router-dom";
import PublicRoutes from "./PublicRoutes";
import AuthRoutes from "./AuthRoutes";
import HomeRoutes from "./HomeRoutes";
import ProfileRoutes from "./ProfileRoutes";
import AdminRoutes from "./AdminRoutes";
import StaffRoutes from "./StaffRoutes";
import MapRoutes from "./MapRoutes";

export default function AppRoutes() {
  return (
    <Routes>
      {HomeRoutes}
      {PublicRoutes}
      {AuthRoutes}
      {ProfileRoutes}
      {AdminRoutes}
      {StaffRoutes}
      {MapRoutes}
    </Routes>
  );
}