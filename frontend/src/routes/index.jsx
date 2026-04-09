import { Routes } from "react-router-dom";
import PublicRoutes from "./PublicRoutes";
import AuthRoutes from "./AuthRoutes";
import HomeRoutes from "./HomeRoutes";
import ProfileRoutes from "./ProfileRoutes";
import AdminRoutes from "./AdminRoutes";
import StaffRoutes from "./StaffRoutes";
import MapRoutes from "./MapRoutes"
import IssueRoutes from "./IssueRoutes";


export default function AppRoutes() {
  return (
    <Routes>
      {HomeRoutes}
      {PublicRoutes}
      {AuthRoutes}
      {ProfileRoutes}
      {IssueRoutes}
      {AdminRoutes}
      {StaffRoutes}
      {MapRoutes}
    </Routes>
  );
}
