import ProtectedRoute from "../components/common/ProtectedRoute.jsx";
import MainLayout from "../layouts/MainLayout.jsx";
import AdminDashboard from "../pages/admin/AdminDashboard.jsx";
import StaffList from "../pages/admin/StaffList.jsx";
import Schedules from "../pages/admin/Schedule.jsx";
import Issues from "../pages/admin/Issues.jsx";
import StaffManagementHome from "../pages/admin/staff-Management/StaffManagementHome.jsx";
import ManageSchedules from "../pages/admin/staff-Management/ManageSchedules.jsx";
import AssignIssues from "../pages/admin/staff-Management/AssignIssues.jsx";
import StaffDashboard from "../pages/staff/Dashboard.jsx";
import MySchedules from "../pages/staff/MySchedules.jsx";
import WorkSummary from "../pages/staffManagement/staff/WorkSummary";

const staffManagementRoutes = [
  {
    path: "/admin/dashboard",
    element: (
      <ProtectedRoute>
        <MainLayout>
          <AdminDashboard />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/staff",
    element: (
      <ProtectedRoute>
        <MainLayout>
          <StaffManagementHome />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/staff/schedules",
    element: (
      <ProtectedRoute>
        <MainLayout>
          <ManageSchedules />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/staff/issues",
    element: (
      <ProtectedRoute>
        <MainLayout>
          <AssignIssues />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/staff-list",
    element: (
      <ProtectedRoute>
        <MainLayout>
          <StaffList />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/schedules",
    element: (
      <ProtectedRoute>
        <MainLayout>
          <Schedules />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/issues",
    element: (
      <ProtectedRoute>
        <MainLayout>
          <Issues />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/staff/dashboard",
    element: (
      <ProtectedRoute>
        <MainLayout>
          <StaffDashboard />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/staff/my-schedules",
    element: (
      <ProtectedRoute>
        <MainLayout>
          <MySchedules />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/staff-management/staff/work-summary",
    element: (
      <ProtectedRoute>
        <MainLayout>
          <WorkSummary />
        </MainLayout>
      </ProtectedRoute>
    ),
  }
];

export default staffManagementRoutes;
