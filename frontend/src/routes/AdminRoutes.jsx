import { Route } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import RequireAdmin from "../components/auth/RequireAdmin";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminUsers from "../pages/admin/Users";
import StaffManagementHome from "../pages/admin/staff-Management/StaffManagementHome";
import ManageSchedules from "../pages/admin/staff-Management/ManageSchedules";
import AssignIssues from "../pages/admin/staff-Management/AssignIssues";

const AdminRoutes = (
  <Route
    element={
      <RequireAdmin>
        <AdminLayout />
      </RequireAdmin>
    }
  >
    <Route path="/admin/dashboard" element={<AdminDashboard />} />
    <Route path="/admin/users" element={<AdminUsers />} />
    <Route path="/admin/staff" element={<StaffManagementHome />} />
    <Route path="/admin/staff/schedules" element={<ManageSchedules />} />
    <Route path="/admin/staff/issues" element={<AssignIssues />} />
  </Route>
);

export default AdminRoutes;
