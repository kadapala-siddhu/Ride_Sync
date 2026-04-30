import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import RoleRoute      from "../components/RoleRoute";
import Layout         from "../components/Layout";

// Public pages
import Login            from "../pages/Login";
import Landing          from "../pages/Landing";
import RegisterProvider from "../pages/RegisterProvider";
import RegisterSeeker   from "../pages/RegisterSeeker";

// Protected pages
import Dashboard     from "../pages/Dashboard";
import CreateRide    from "../pages/CreateRide";
import AvailableRides from "../pages/AvailableRides";
import MyRides       from "../pages/MyRides";
import JoinedRides   from "../pages/JoinedRides";
import RideHistory   from "../pages/RideHistory";
import Profile       from "../pages/Profile";

const PL = ({ children }) => (
  <ProtectedRoute>
    <Layout>{children}</Layout>
  </ProtectedRoute>
);

const AppRoutes = () => (
  <Routes>
    {/* ── Public ── */}
    <Route path="/"                   element={<Login />} />
    <Route path="/about"              element={<Landing />} />
    <Route path="/login"              element={<Navigate to="/" replace />} />
    <Route path="/register/provider"  element={<RegisterProvider />} />
    <Route path="/register/seeker"    element={<RegisterSeeker />} />

    {/* ── Protected (all roles) ── */}
    <Route path="/dashboard"    element={<PL><Dashboard /></PL>} />
    <Route path="/ride-history" element={<PL><RideHistory /></PL>} />
    <Route path="/profile"      element={<PL><Profile /></PL>} />

    {/* ── Provider only ── */}
    <Route path="/create-ride" element={<PL><RoleRoute role="provider"><CreateRide /></RoleRoute></PL>} />
    <Route path="/my-rides"    element={<PL><RoleRoute role="provider"><MyRides /></RoleRoute></PL>} />

    {/* ── Seeker only ── */}
    <Route path="/available-rides" element={<PL><RoleRoute role="seeker"><AvailableRides /></RoleRoute></PL>} />
    <Route path="/joined-rides"    element={<PL><RoleRoute role="seeker"><JoinedRides /></RoleRoute></PL>} />

    {/* ── Fallback ── */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default AppRoutes;
