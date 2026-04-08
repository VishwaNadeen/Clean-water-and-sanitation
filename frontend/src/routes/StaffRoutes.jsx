import { Route } from "react-router-dom";
import StaffLayout from "../layouts/StaffLayout";
import RequireStaff from "../components/auth/RequireStaff";
import StaffDashboard from "../pages/staff/StaffDashboard";

const StaffRoutes = (
  <Route
    element={
      <RequireStaff>
        <StaffLayout />
      </RequireStaff>
    }
  >
    <Route path="/staff/dashboard" element={<StaffDashboard />} />
  </Route>
);

export default StaffRoutes;