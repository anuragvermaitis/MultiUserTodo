import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";

import TodoPage from "./todos/TodoPage";
import LoginPage from "./auth/LoginPage";
import RegisterPage from "./auth/RegisterPage";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminPage from "./admin/AdminPage";
import TeamPage from "./team/TeamPage";
import WorkspacePage from "./workspace/WorkspacePage";
import Footer from "./components/Footer";
import { useEffect } from "react";
import { onIdTokenChanged, setPersistence, browserLocalPersistence } from "firebase/auth";
import { auth } from "./auth/firebase";
import { storeToken, clearToken } from "./auth/authSession";

function App() {
  useEffect(() => {
    let unsubscribe = () => {};
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        unsubscribe = onIdTokenChanged(auth, async (user) => {
          if (user) {
            const token = await user.getIdToken(true);
            storeToken(token);
          } else {
            clearToken();
          }
        });
      })
      .catch(() => {
        unsubscribe = onIdTokenChanged(auth, async (user) => {
          if (user) {
            const token = await user.getIdToken(true);
            storeToken(token);
          } else {
            clearToken();
          }
        });
      });

    return () => unsubscribe();
  }, []);

  return (
    <BrowserRouter>
      <div className="app-bg min-h-screen text-slate-900">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Navigate to="/todos" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route
              path="/todos"
              element={
                <ProtectedRoute requireWorkspace={false}>
                  <TodoPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workspace"
              element={
                <ProtectedRoute requireWorkspace={false}>
                  <WorkspacePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/team"
              element={
                <ProtectedRoute>
                  <TeamPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRoles={["admin", "manager"]}>
                  <AdminPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/todos" replace />} />
          </Routes>
          <Footer />
        </main>
        <Analytics />
      </div>
    </BrowserRouter>
  );
}

export default App;
