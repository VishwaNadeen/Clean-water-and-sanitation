import { Route } from "react-router-dom";
import About from "../pages/public/About";
import Contact from "../pages/public/Contact";
import ReportIssueDummy from "../pages/issue/ReportIssueDummy";

const PublicRoutes = (
  <>
    <Route path="/about" element={<About />} />
    <Route path="/contact" element={<Contact />} />
    <Route path="/report-issue" element={<ReportIssueDummy/>} />
  </>
);

export default PublicRoutes;
