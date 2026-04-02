import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user?.user) return <Navigate to="/login" />;
  if (!user.user.isAdmin) return <Navigate to="/" />;

  return children;
};

export default AdminRoute;
