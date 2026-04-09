/**
 * MapRoutes.jsx
 *
 * Defines the /rest-rooms route.
 *
 * - Uses MainLayout so the Navbar and Footer appear as normal.
 * - NO auth guard — the map is fully public.
 * - Path matches the "Rest Rooms" nav link already in Navbar.jsx
 *   ({ to: "/rest-rooms", label: "Rest Rooms" })
 *
 * HOW TO REGISTER THIS ROUTE:
 * Add ONE line to frontend/src/routes/index.jsx:
 *
 *   import MapRoutes from "./MapRoutes";        // ← add this import
 *
 *   export default function AppRoutes() {
 *     return (
 *       <Routes>
 *         {HomeRoutes}
 *         {PublicRoutes}
 *         {AuthRoutes}
 *         {ProfileRoutes}
 *         {AdminRoutes}
 *         {StaffRoutes}
 *         {MapRoutes}   ← add this line
 *       </Routes>
 *     );
 *   }
 */

import { Route } from "react-router-dom";
import MainLayout   from "../layouts/MainLayout";
import RestroomMap  from "../pages/map/RestroomMap";

const MapRoutes = (
  // MainLayout wraps everything — gives us Navbar + Footer automatically
  <Route element={<MainLayout />}>
    <Route path="/rest-rooms" element={<RestroomMap />} />
  </Route>
);

export default MapRoutes;
