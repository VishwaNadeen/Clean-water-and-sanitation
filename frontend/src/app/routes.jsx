import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home.jsx";
import NotFound from "../pages/NotFound.jsx";

import StaffManagerDashboard from "../pages/staff-Management/StaffManagerDashboard";
import StaffRoleDashboard from "../pages/staff-Management/StaffRoleDashboard";


export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="*" element={<NotFound />} />

      <Route path="/manager/dashboard" element={<StaffManagerDashboard />} />
      <Route path="/staff/role" element={<StaffRoleDashboard />} />

    </Routes>
  );
}