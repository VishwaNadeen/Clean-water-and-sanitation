import { Route } from "react-router-dom";
import AdminLayout    from "../layouts/AdminLayout";
import RequireAdmin   from "../components/auth/RequireAdmin";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminUsers     from "../pages/admin/Users";
import RestroomList   from "../pages/admin/restrooms/RestroomList";
import CreateRestroom from "../pages/admin/restrooms/CreateRestroom";
import EditRestroom   from "../pages/admin/restrooms/EditRestroom";

const AdminRoutes = (
  <Route
    element={
      <RequireAdmin>
        <AdminLayout />
      </RequireAdmin>
    }
  >
    <Route path="/admin/dashboard"              element={<AdminDashboard />} />
    <Route path="/admin/users"                  element={<AdminUsers />} />
    <Route path="/admin/restrooms"              element={<RestroomList />} />
    <Route path="/admin/restrooms/create"       element={<CreateRestroom />} />
    <Route path="/admin/restrooms/:id/edit"     element={<EditRestroom />} />
  </Route>
);

export default AdminRoutes;
