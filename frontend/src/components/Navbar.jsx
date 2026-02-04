import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/client";

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => setUser(res.data.user))
      .catch(() => setUser(null));
  }, []);

  const handleLogout = async () => {
    await api.post("/auth/logout"); 
    setUser(null);
    navigate("/login");
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        
        <div className="font-semibold text-lg">
          Todo App
        </div>

        <div className="space-x-4 text-sm">
          <Link className="text-gray-600 hover:text-gray-900" to="/todos">
            Todos
          </Link>

          {!user ? (
            <>
              <Link className="text-gray-600 hover:text-gray-900" to="/login">
                Login
              </Link>
              <Link className="text-gray-600 hover:text-gray-900" to="/register">
                Register
              </Link>
            </>
          ) : (
            <>
              {user.role === "admin" && (
                <Link
                  className="text-gray-600 hover:text-gray-900"
                  to="/admin"
                >
                  Admin
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="text-red-600 hover:text-red-800"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
