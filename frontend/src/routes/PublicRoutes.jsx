import { Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import About from "../pages/public/About";
import Contact from "../pages/public/Contact";

const PublicRoutes = (
  <Route element={<MainLayout />}>
    <Route path="/about" element={<About />} />
    <Route path="/contact" element={<Contact />} />
  </Route>
);

export default PublicRoutes;