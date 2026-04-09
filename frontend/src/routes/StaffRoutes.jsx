import { Navigate, Route } from "react-router-dom";
import StaffLayout from "../layouts/StaffLayout";
import RequireStaff from "../components/auth/RequireStaff";
import Dashboard from "../pages/staff/Dashboard";
import WorkSummary from "../pages/staff/WorkSummary";
import MySchedules from "../pages/staff/MySchedules";
import Profile from "../pages/profile/Profile.jsx";
import EditProfile from "../pages/profile/EditProfile.jsx";
import DeleteProfile from "../pages/profile/DeleteProfile.jsx";

const StaffRoutes = (
  <Route
    element={
      <RequireStaff>
        <StaffLayout />
      </RequireStaff>
    }
  >
    <Route path="/staff/dashboard" element={<Dashboard />} />
    <Route path="/staff/work-summary" element={<WorkSummary />} />
    <Route
      path="/staff-management/staff/work-summary"
      element={<Navigate to="/staff/work-summary" replace />}
    />
    <Route path="/staff/my-schedules" element={<MySchedules />} />
    <Route path="/staff/profile" element={<Profile />} />
    <Route path="/staff/profile/edit" element={<EditProfile />} />
    <Route path="/staff/profile/delete" element={<DeleteProfile />} />
  </Route>
);

export default StaffRoutes;
