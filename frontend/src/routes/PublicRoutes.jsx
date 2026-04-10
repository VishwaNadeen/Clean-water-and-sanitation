import { Navigate, Route, useLocation } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import About from "../pages/public/About";
import Contact from "../pages/public/Contact";

function ReportIssueRedirect() {
  const location = useLocation();

  return (
    <Navigate
      to={`/issues/create${location.search}`}
      replace
    />
  );
}

const PublicRoutes = (
  <Route element={<MainLayout />}>
    <Route path="/about" element={<About />} />
    <Route path="/contact" element={<Contact />} />
    <Route path="/report-issue" element={<ReportIssueRedirect />} />
  </Route>
);

export default PublicRoutes;
