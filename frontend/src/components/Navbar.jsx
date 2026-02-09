import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/client";
import { fetchWorkspace } from "../api/workspace.api";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../auth/firebase";
import { clearToken, getAuthToken, waitForAuthInit } from "../auth/authSession";
import runnerMark from "../assets/runner-mark.svg";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [workspace, setWorkspace] = useState(null);
  const [isAuthed, setIsAuthed] = useState(false);
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setIsAuthed(Boolean(currentUser));
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const initial = stored || "dark";
    setTheme(initial);
    localStorage.setItem("theme", initial);
    document.documentElement.classList.toggle("theme-dark", initial === "dark");
  }, []);

  const toggleTheme = () => {
    let next = "dark";
    if (theme === "dark") {
      next = "light";
    }
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("theme-dark", next === "dark");
  };

  useEffect(() => {
    let isMounted = true;
    const protectedPaths = ["/todos", "/team", "/admin", "/workspace"];

    const loadUser = async () => {
      if (!protectedPaths.includes(location.pathname)) {
        setUser(null);
        setWorkspace(null);
        return;
      }

      await waitForAuthInit();
      const token = await getAuthToken();
      if (!token || !isMounted) {
        setUser(null);
        setWorkspace(null);
        return;
      }

      api
        .get("/auth/me")
        .then(async (res) => {
          if (!isMounted) return;
          setUser(res.data.user);
          if (res.data.user?.workspace) {
            try {
              const data = await fetchWorkspace();
              if (isMounted) setWorkspace(data);
            } catch {
              if (isMounted) setWorkspace(null);
            }
          } else {
            setWorkspace(null);
          }
        })
        .catch(() => {
          if (!isMounted) return;
          setUser(null);
          setWorkspace(null);
        });
    };

    loadUser();

    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  const handleLogout = async () => {
    await signOut(auth);
    clearToken();
    setUser(null);
    setWorkspace(null);
    navigate("/login");
  };

  const isLogin = location.pathname === "/login";
  const isRegister = location.pathname === "/register";

  return (
    <nav className="sticky top-0 z-30 backdrop-blur bg-white/80 border-b border-slate-200/70">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to={isAuthed ? "/todos" : "/login"} className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 via-blue-500 to-sky-400 shadow-sm flex items-center justify-center">
              <img src={runnerMark} alt="" className="h-6 w-6" />
            </div>
            <div>
              <div className="font-display text-lg font-semibold leading-tight">TaskLedger</div>
              <div className="hidden sm:block text-xs text-slate-500">Shared todos, simple.</div>
            </div>
          </Link>
          <a
            className="hidden sm:inline-flex items-center rounded-full border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-600 hover:border-slate-300 hover:text-slate-900"
            href="https://github.com/anuragvermaitis/MultiUserTodo"
            target="_blank"
            rel="noreferrer"
            aria-label="View project on GitHub"
            title="View project on GitHub"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
              <path
                fill="currentColor"
                d="M12 2C6.48 2 2 6.58 2 12.26c0 4.5 2.87 8.32 6.84 9.67.5.1.68-.22.68-.48 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.36-3.37-1.36-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.63.07-.63 1 .07 1.53 1.05 1.53 1.05.9 1.57 2.36 1.12 2.94.86.09-.67.35-1.12.64-1.38-2.22-.26-4.56-1.14-4.56-5.08 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.32.1-2.75 0 0 .84-.28 2.75 1.05A9.3 9.3 0 0 1 12 7.1c.85 0 1.71.12 2.51.35 1.9-1.33 2.75-1.05 2.75-1.05.55 1.43.2 2.49.1 2.75.64.72 1.03 1.63 1.03 2.75 0 3.95-2.35 4.82-4.58 5.08.36.32.69.95.69 1.92 0 1.38-.01 2.49-.01 2.83 0 .26.18.58.69.48 3.96-1.36 6.82-5.17 6.82-9.67C22 6.58 17.52 2 12 2z"
              />
            </svg>
          </a>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <button
            onClick={toggleTheme}
            className="theme-toggle"
            type="button"
            aria-label="Toggle theme"
            title="Toggle theme"
          >
            <span className={`theme-toggle-dot ${theme === "dark" ? "theme-toggle-dot-dark" : ""}`} />
          </button>
          {isAuthed && (
            <Link
              className={`nav-link ${location.pathname === "/todos" ? "nav-link-active" : ""}`}
              to="/todos"
            >
              Todos
            </Link>
          )}

          {isAuthed && (
            <Link
              className={`nav-link ${location.pathname === "/workspace" ? "nav-link-active" : ""}`}
              to="/workspace"
            >
              Workspace
            </Link>
          )}

          {user && user.workspace && (
            <Link
              className={`nav-link ${location.pathname === "/team" ? "nav-link-active" : ""}`}
              to="/team"
            >
              Team
            </Link>
          )}

          {user && ["admin", "manager"].includes(user.role) && (
            <Link
              className={`nav-link ${location.pathname === "/admin" ? "nav-link-active" : ""}`}
              to="/admin"
            >
              Admin
            </Link>
          )}

          {!isAuthed ? (
            <>
              <Link className={`btn-outline ${isLogin ? "btn-outline-active" : ""}`} to="/login">
                Login
              </Link>
              <Link
                className={`btn-solid ${isRegister ? "btn-solid-active" : ""}`}
                to="/register"
              >
                Create account
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end leading-tight">
                <div className="text-sm font-semibold text-slate-800">{user?.name || "Account"}</div>
                <div className="text-[11px] uppercase tracking-wider text-slate-500">{user?.role || "member"}</div>
                {workspace?.name && (
                  <div className="text-[11px] text-slate-400">{workspace.name}</div>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-slate-300 hover:text-slate-900"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
