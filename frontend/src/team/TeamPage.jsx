import { useEffect, useState } from "react";
import api from "../api/client";
import { fetchTeamUsers, upsertMemberNote } from "../api/admin.api";

const TeamPage = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [noteDrafts, setNoteDrafts] = useState({});
  const [noteSaving, setNoteSaving] = useState(null);
  const [noteOpen, setNoteOpen] = useState({});

  useEffect(() => {
    setLoading(true);
    fetchTeamUsers()
      .then(setUsers)
      .catch(() => setError("Unable to load team overview."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => setCurrentUser(res.data.user))
      .catch(() => setCurrentUser(null));
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    setNoteDrafts((prev) => {
      const next = { ...prev };
      users.forEach((user) => {
        if (next[user._id] !== undefined) return;
        const myNote = (user.notes || []).find(
          (note) => note.authorUser?._id === currentUser._id
        );
        if (myNote) {
          next[user._id] = myNote.text || "";
        }
      });
      return next;
    });
  }, [users, currentUser]);

  const todos = users.flatMap((user) => user.todos || []);
  const totalUsers = users.length;
  const totalTodos = todos.length;
  const completed = todos.filter((t) => t.completed).length;

  let visibleUsers = users;
  const query = search.trim().toLowerCase();
  if (query) {
    visibleUsers = users.filter((user) =>
      [user.name, user.email, user.role].some((value) =>
        value?.toLowerCase().includes(query)
      )
    );
  }

  const canNote = currentUser && ["admin", "manager"].includes(currentUser.role);

  const isOverdue = (todo) => {
    if (!todo.deadline) return false;
    if (todo.completed) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(todo.deadline) < today;
  };

  const handleNoteSave = async (userId) => {
    const text = noteDrafts[userId] || "";
    setNoteSaving(userId);
    setError("");
    try {
      const saved = await upsertMemberNote(userId, text);
      setUsers((prev) =>
        prev.map((user) => {
          if (user._id !== userId) return user;
          const nextNotes = (user.notes || []).filter(
            (note) => note.authorUser?._id !== saved.authorUser?._id
          );
          return { ...user, notes: [...nextNotes, saved] };
        })
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save note.");
    } finally {
      setNoteSaving(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Team Overview</p>
          <h1 className="font-display text-3xl font-semibold">Buddy board snapshot</h1>
          <p className="mt-2 text-sm text-slate-600">
            See each other’s todos and keep the momentum shared.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-white/80 p-4 shadow-sm">
            <p className="text-xs uppercase text-slate-500">Users</p>
            <p className="font-display text-2xl font-semibold">{totalUsers}</p>
          </div>
          <div className="rounded-2xl bg-white/80 p-4 shadow-sm">
            <p className="text-xs uppercase text-slate-500">Tasks</p>
            <p className="font-display text-2xl font-semibold">{totalTodos}</p>
          </div>
          <div className="rounded-2xl bg-white/80 p-4 shadow-sm">
            <p className="text-xs uppercase text-slate-500">Completed</p>
            <p className="font-display text-2xl font-semibold text-emerald-600">{completed}</p>
          </div>
        </div>
      </div>

      <div className="card-shell rounded-3xl p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold">Team radar</h2>
            <p className="text-sm text-slate-500">Spot where your buddies are focused.</p>
          </div>
          <input
            className="w-full md:max-w-xs rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            placeholder="Search by name, email, role"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="mt-6 space-y-4">
          {loading && (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-6 text-sm text-slate-500">
              Loading team...
            </div>
          )}

          {!loading && error && (
            <div className="rounded-2xl border border-dashed border-rose-200 bg-rose-50/60 p-6 text-sm text-rose-600">
              {error}
            </div>
          )}

          {!loading && !error && visibleUsers.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-6 text-sm text-slate-500">
              No users match your search.
            </div>
          )}

          {visibleUsers.map((user) => {
            const totalTodos = user.todos?.length || 0;
            const completed = user.todos?.filter((t) => t.completed).length || 0;
            const pending = totalTodos - completed;
            const userNotes = user.notes || [];
            const isSelf = currentUser?._id === user._id;

            return (
              <div key={user._id} className="rounded-2xl border border-slate-200 bg-white/80 p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="font-display text-lg font-semibold">{user.name}</h3>
                    <p className="text-sm text-slate-500">{user.email}</p>
                    <span className="mt-2 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {user.role}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <div className="rounded-2xl bg-slate-50 px-4 py-2 text-center">
                      <p className="text-xs uppercase text-slate-500">Tasks</p>
                      <p className="font-display text-lg font-semibold">{totalTodos}</p>
                    </div>
                    <div className="rounded-2xl bg-emerald-50 px-4 py-2 text-center">
                      <p className="text-xs uppercase text-slate-500">Done</p>
                      <p className="font-display text-lg font-semibold text-emerald-600">{completed}</p>
                    </div>
                    <div className="rounded-2xl bg-amber-50 px-4 py-2 text-center">
                      <p className="text-xs uppercase text-slate-500">Open</p>
                      <p className="font-display text-lg font-semibold text-amber-600">{pending}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Recent tasks</p>
                  <div className="mt-2 grid gap-2 md:grid-cols-2">
                    {(user.todos || []).slice(0, 4).map((todo) => (
                      <div
                        key={todo._id}
                        className={`rounded-xl border border-slate-200 px-3 py-2 text-sm ${
                          todo.completed
                            ? "bg-emerald-50/80"
                            : isOverdue(todo)
                              ? "bg-rose-50/80"
                              : "bg-white/70"
                        }`}
                      >
                        <div className="font-semibold text-slate-800">{todo.name}</div>
                        <div className="text-xs text-slate-500">
                          {todo.completed ? "✅ Completed" : isOverdue(todo) ? "Overdue" : "In progress"}
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

                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Member notes
                    </p>
                    {canNote && !isSelf && (
                      <button
                        className="btn-ghost text-xs"
                        onClick={() =>
                          setNoteOpen((prev) => ({ ...prev, [user._id]: !prev[user._id] }))
                        }
                      >
                        {noteOpen[user._id] ? "Hide note" : "Add note"}
                      </button>
                    )}
                  </div>

                  {userNotes.length === 0 && (
                    <div className="mt-2 rounded-xl border border-dashed border-slate-200 bg-white/60 px-3 py-2 text-sm text-slate-500">
                      No notes yet.
                    </div>
                  )}

                  {userNotes.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {userNotes.map((note) => (
                        <div key={note._id} className="rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm">
                          <div className="text-xs text-slate-500">
                            {note.authorUser?.name || "Admin"} · {new Date(note.updatedAt).toLocaleDateString()}
                          </div>
                          <div className="text-slate-700">{note.text}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {canNote && !isSelf && noteOpen[user._id] && (
                    <div className="mt-3 space-y-2">
                      <textarea
                        className="w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        rows={3}
                        placeholder="Add a quick buddy note"
                        value={noteDrafts[user._id] || ""}
                        onChange={(e) =>
                          setNoteDrafts((prev) => ({ ...prev, [user._id]: e.target.value }))
                        }
                      />
                      <button
                        onClick={() => handleNoteSave(user._id)}
                        className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                        disabled={noteSaving === user._id}
                      >
                        Save note
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TeamPage;
