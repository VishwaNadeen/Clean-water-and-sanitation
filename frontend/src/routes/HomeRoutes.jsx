import { Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Home from "../pages/home/Home";

const HomeRoutes = (
  <Route element={<MainLayout />}>
    <Route path="/" element={<Home />} />
  </Route>
);

export default HomeRoutes;