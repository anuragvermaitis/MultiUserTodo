import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import api from "../api/client";
import { getAuthToken, waitForAuthInit } from "../auth/authSession";

const ProtectedRoute = ({ children, requiredRole, requiredRoles, requireWorkspace = true }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [hasToken, setHasToken] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      await waitForAuthInit();
      const token = await getAuthToken();
      if (!token) {
        if (isMounted) {
          setUser(null);
          setHasToken(false);
          setLoading(false);
        }
        return;
      }
      if (isMounted) {
        setHasToken(true);
      }

      api
        .get("/auth/me")
        .then((res) => {
          if (isMounted) setUser(res.data.user);
        })
        .catch(() => {
          if (isMounted) setUser(null);
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    };

    loadUser();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return null;
  }

  if (!hasToken) {
    return <Navigate to="/login" replace />;
  }

  if (requireWorkspace && user && !user.workspace) {
    return <Navigate to="/workspace" replace state={{ from: location.pathname }} />;
  }

  const roleList = requiredRoles || (requiredRole ? [requiredRole] : null);
  if (roleList && user && !roleList.includes(user.role)) {
    return <Navigate to="/todos" replace />;
  }

  if ((requireWorkspace || roleList) && !user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
