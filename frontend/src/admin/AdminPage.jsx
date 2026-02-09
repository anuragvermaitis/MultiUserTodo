import { useEffect, useState } from "react";
import api from "../api/client";
import { fetchAdminUsers, removeMember, updateUserRole } from "../api/admin.api";

const roleOptions = ["user", "manager", "admin"];

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchAdminUsers()
      .then(setUsers)
      .catch(() => setError("Unable to load admin dashboard."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => setCurrentUser(res.data.user))
      .catch(() => setCurrentUser(null));
  }, []);

  let visibleUsers = users;
  const query = search.trim().toLowerCase();
  if (query) {
    visibleUsers = users.filter((user) =>
      [user.name, user.email, user.role].some((value) =>
        value?.toLowerCase().includes(query)
      )
    );
  }

  const handleRoleChange = async (userId, role) => {
    setSavingId(userId);
    setError("");
    try {
      const updated = await updateUserRole(userId, role);
      setUsers((prev) =>
        prev.map((user) => (user._id === userId ? { ...user, ...updated } : user))
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update role.");
    } finally {
      setSavingId(null);
    }
  };

  const handleRemove = async (userId) => {
    setRemovingId(userId);
    setError("");
    try {
      await removeMember(userId);
      setUsers((prev) => prev.filter((user) => user._id !== userId));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove member.");
    } finally {
      setRemovingId(null);
    }
  };

  const totalTodos = users.reduce((acc, user) => acc + (user.todos?.length || 0), 0);
  const canManageRoles = currentUser?.role === "admin";
  const canRemove = currentUser && ["admin", "manager"].includes(currentUser.role);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Admin</p>
          <h1 className="font-display text-3xl font-semibold">Team controls</h1>
          <p className="mt-1 text-sm text-slate-600">Manage roles and access.</p>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="rounded-2xl bg-white/80 p-3 shadow-sm">
            <p className="text-xs uppercase text-slate-500">Users</p>
            <p className="font-display text-xl font-semibold">{users.length}</p>
          </div>
          <div className="rounded-2xl bg-white/80 p-3 shadow-sm">
            <p className="text-xs uppercase text-slate-500">Tasks</p>
            <p className="font-display text-xl font-semibold">{totalTodos}</p>
          </div>
          <div className="rounded-2xl bg-white/80 p-3 shadow-sm">
            <p className="text-xs uppercase text-slate-500">Managers</p>
            <p className="font-display text-xl font-semibold text-indigo-600">
              {users.filter((user) => user.role === "manager").length}
            </p>
          </div>
        </div>
      </div>

      <div className="card-shell rounded-3xl p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold">Users</h2>
            <p className="text-sm text-slate-500">Update roles and remove access.</p>
          </div>
          <input
            className="w-full md:max-w-xs rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            placeholder="Search by name, email, role"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50/60 p-4 text-sm text-rose-600">
            {error}
          </div>
        )}

        <div className="mt-6 space-y-4">
          {loading && (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-6 text-sm text-slate-500">
              Loading admin dashboard...
            </div>
          )}

          {!loading && visibleUsers.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-6 text-sm text-slate-500">
              No users match your search.
            </div>
          )}

          {visibleUsers.map((user) => {
            const completed = user.todos?.filter((t) => t.completed).length || 0;
            const total = user.todos?.length || 0;

            return (
              <div key={user._id} className="rounded-2xl border border-slate-200 bg-white/80 p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="font-display text-lg font-semibold">{user.name}</h3>
                    <p className="text-sm text-slate-500">{user.email}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="rounded-2xl bg-slate-50 px-4 py-2 text-center">
                      <p className="text-xs uppercase text-slate-500">Tasks</p>
                      <p className="font-display text-lg font-semibold">{total}</p>
                    </div>
                    <div className="rounded-2xl bg-emerald-50 px-4 py-2 text-center">
                      <p className="text-xs uppercase text-slate-500">Done</p>
                      <p className="font-display text-lg font-semibold text-emerald-600">{completed}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Role</label>
                      <select
                        className="mt-2 rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        value={user.role}
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                        disabled={savingId === user._id || !canManageRoles}
                      >
                        {roleOptions.map((role) => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </div>
                    {canRemove &&
                      user._id !== currentUser?._id &&
                      (currentUser?.role === "admin" || user.role !== "admin") && (
                      <button
                        onClick={() => handleRemove(user._id)}
                        disabled={removingId === user._id}
                        className="rounded-xl bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-500 disabled:opacity-60"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tasks snapshot</p>
                  <div className="mt-2 grid gap-2 md:grid-cols-2">
                    {(user.todos || []).slice(0, 4).map((todo) => (
                      <div key={todo._id} className="rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm">
                        <div className="font-semibold text-slate-800">{todo.name}</div>
                        <div className="text-xs text-slate-500">
                          {todo.completed ? "Completed" : "In progress"}
                        </div>
                      </div>
                    ))}
                    {(!user.todos || user.todos.length === 0) && (
                      <div className="rounded-xl border border-dashed border-slate-200 bg-white/60 px-3 py-2 text-sm text-slate-500">
                        No tasks yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
