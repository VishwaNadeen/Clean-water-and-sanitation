import { Route } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import RequireAdmin from "../components/auth/RequireAdmin";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminUsers from "../pages/admin/Users";
import Complaints from "../pages/admin/Complaints";
import Categories from "../pages/admin/Categories";

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
    <Route path="/admin/complaints" element={<Complaints />} />
    <Route path="/admin/categories" element={<Categories />} />
  </Route>
);

export default AdminRoutes;
