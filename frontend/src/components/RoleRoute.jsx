import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * RoleRoute — only renders children if user has the required role.
 * Otherwise redirects to /dashboard (where role-specific UI handles messaging).
 *
 * <RoleRoute role="provider"><CreateRide /></RoleRoute>
 */
const RoleRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user || user.role !== role) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default RoleRoute;
