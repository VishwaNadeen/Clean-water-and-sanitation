import { Route } from "react-router-dom";
import ProtectedRoute from "../components/common/ProtectedRoute.jsx";
import CreateIssue from "../pages/issues/CreateIssue.jsx";
import ReadIssues from "../pages/issues/ReadIssues.jsx";
import ViewIssue from "../pages/issues/ViewIssue.jsx";
import UpdateIssue from "../pages/issues/UpdateIssue.jsx";

const IssueRoutes = (
  <Route
    element={<ProtectedRoute />}
  >
    <Route path="/complaints/report" element={<CreateIssue />} />
    <Route path="/my-complaints" element={<ReadIssues />} />
    <Route path="/my-complaints/:id" element={<ViewIssue />} />
    <Route path="/my-complaints/:id/edit" element={<UpdateIssue />} />

    <Route path="/issues/create" element={<CreateIssue />} />
    <Route path="/issues/me" element={<ReadIssues />} />
    <Route path="/issues/me/:id" element={<ViewIssue />} />
    <Route path="/issues/me/:id/edit" element={<UpdateIssue />} />
  </Route>
);

export default IssueRoutes;
