import { useEffect, useState } from "react";
import api from "../api/client";
import { createWorkspace, deleteWorkspace, fetchWorkspace, joinWorkspace, leaveWorkspace, refreshInviteCode, transferWorkspaceOwner, updateWorkspaceName } from "../api/workspace.api";

const WorkspacePage = () => {
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [saving, setSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [transferTarget, setTransferTarget] = useState("");
  const [editingName, setEditingName] = useState("");

  useEffect(() => {
    fetchWorkspace()
      .then(setWorkspace)
      .catch(() => setWorkspace(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => setCurrentUser(res.data.user))
      .catch(() => setCurrentUser(null));
  }, []);

  useEffect(() => {
    if (workspace?.name) {
      setEditingName(workspace.name);
    }
  }, [workspace]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Please enter a workspace name.");
      return;
    }
    try {
      setSaving(true);
      const data = await createWorkspace(name.trim());
      setWorkspace(data);
      setName("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create workspace.");
    } finally {
      setSaving(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    setError("");
    if (!code.trim()) {
      setError("Please enter the invite code.");
      return;
    }
    try {
      setSaving(true);
      const data = await joinWorkspace(code.trim());
      setWorkspace(data);
      setCode("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to join workspace.");
    } finally {
      setSaving(false);
    }
  };

  const handleRefreshCode = async () => {
    try {
      setSaving(true);
      const data = await refreshInviteCode();
      setWorkspace(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to refresh invite code.");
    } finally {
      setSaving(false);
    }
  };

  const handleLeave = async () => {
    setError("");
    try {
      setSaving(true);
      await leaveWorkspace();
      setWorkspace(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to leave workspace.");
    } finally {
      setSaving(false);
    }
  };

  const handleTransfer = async () => {
    setError("");
    if (!transferTarget) {
      setError("Choose a member to transfer admin role.");
      return;
    }
    try {
      setSaving(true);
      await transferWorkspaceOwner(transferTarget);
      const data = await fetchWorkspace();
      setWorkspace(data);
      setTransferTarget("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to transfer ownership.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setError("");
    try {
      setSaving(true);
      await deleteWorkspace();
      setWorkspace(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete workspace.");
    } finally {
      setSaving(false);
    }
  };

  const handleRename = async () => {
    setError("");
    if (!editingName.trim()) {
      setError("Workspace name cannot be empty.");
      return;
    }
    try {
      setSaving(true);
      const data = await updateWorkspaceName(editingName.trim());
      setWorkspace((prev) => ({ ...prev, ...data }));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update workspace name.");
    } finally {
      setSaving(false);
    }
  };

  const isManagerOrAdmin = currentUser && ["admin", "manager"].includes(currentUser.role);
  const isOriginalAdmin =
    currentUser && workspace?.createdBy && String(workspace.createdBy) === String(currentUser._id);
  const membersCount = workspace?.members?.length || 0;
  const canLeave =
    !isOriginalAdmin || membersCount <= 1 || String(workspace.createdBy) !== String(currentUser?._id);

  if (loading) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-6 text-sm text-slate-500">
        Loading workspace...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Workspace</p>
        <h1 className="font-display text-3xl font-semibold">Set up your buddy space</h1>
        <p className="mt-2 text-sm text-slate-600">
          Built for buddy progress sharing—create a space or join with an invite code.
        </p>
      </div>

      {workspace ? (
        <div className="card-shell rounded-3xl p-6">
          <h2 className="font-display text-xl font-semibold">{workspace.name}</h2>
          <p className="mt-1 text-sm text-slate-500">Invite friends to join with this code.</p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
              {workspace.code}
            </div>
            {isManagerOrAdmin && (
              <button
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:border-slate-300"
                onClick={handleRefreshCode}
                disabled={saving}
              >
                Refresh code
              </button>
            )}
            <button
              className="rounded-xl bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-500 disabled:opacity-60"
              onClick={handleLeave}
              disabled={saving || !canLeave}
            >
              Leave workspace
            </button>
          </div>

          {currentUser?.role === "admin" && (
            <div className="mt-6 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Workspace name</p>
              <div className="flex flex-wrap gap-2">
                <input
                  className="flex-1 min-w-[220px] rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                />
                <button
                  className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                  onClick={handleRename}
                  disabled={saving}
                >
                  Save name
                </button>
              </div>
            </div>
          )}

          {workspace.members && (
            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Members</p>
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                {workspace.members.map((member) => (
                  <div key={member._id} className="rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm">
                    <div className="font-semibold text-slate-800">{member.name}</div>
                    <div className="text-xs text-slate-500">{member.email} · {member.role}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isOriginalAdmin && membersCount > 1 && (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/60 p-4 text-sm text-amber-700">
              You are the original admin. Transfer admin to another member before leaving.
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <select
                  className="rounded-xl border border-amber-200 bg-white/80 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
                  value={transferTarget}
                  onChange={(e) => setTransferTarget(e.target.value)}
                >
                  <option value="">Select member</option>
                  {workspace.members
                    ?.filter((member) => member._id !== currentUser?._id)
                    .map((member) => (
                      <option key={member._id} value={member._id}>
                        {member.name} ({member.role})
                      </option>
                    ))}
                </select>
                <button
                  className="rounded-xl bg-amber-600 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-500 disabled:opacity-60"
                  onClick={handleTransfer}
                  disabled={saving || !transferTarget}
                >
                  Transfer admin
                </button>
              </div>
            </div>
          )}

          {currentUser?.role === "admin" && (
            <div className="mt-6">
              <button
                className="rounded-xl bg-rose-700 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-600 disabled:opacity-60"
                onClick={handleDelete}
                disabled={saving}
              >
                Delete workspace
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <form onSubmit={handleCreate} className="card-shell rounded-3xl p-6 space-y-4">
            <div>
              <h2 className="font-display text-xl font-semibold">Create a workspace</h2>
              <p className="text-sm text-slate-500">Become the admin and invite your buddies.</p>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Workspace name</label>
              <input
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="Study Squad"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <button
              className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
              type="submit"
              disabled={saving}
            >
              Create workspace
            </button>
          </form>

          <form onSubmit={handleJoin} className="card-shell rounded-3xl p-6 space-y-4">
            <div>
              <h2 className="font-display text-xl font-semibold">Join a workspace</h2>
              <p className="text-sm text-slate-500">Use the invite code from a buddy.</p>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Invite code</label>
              <input
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="AB12CD"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
              />
            </div>
            <button
              className="w-full rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
              type="submit"
              disabled={saving}
            >
              Join workspace
            </button>
          </form>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-4 text-sm text-rose-600">
          {error}
        </div>
      )}
    </div>
  );
};

export default WorkspacePage;
