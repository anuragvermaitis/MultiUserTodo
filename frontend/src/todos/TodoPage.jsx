import { useEffect, useMemo, useState } from "react";
import api from "../api/client";
import { waitForAuthInit, getAuthToken } from "../auth/authSession";
import {
  fetchTodos,
  createTodo,
  deleteTodo,
  updateTodo,
} from "../api/todo.api";

const filters = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "overdue", label: "Overdue" },
  { value: "archived", label: "Archived" },
];

const sortOptions = [
  { value: "deadline", label: "Deadline" },
  { value: "created", label: "Created" },
  { value: "name", label: "Name" },
];

const TodoPage = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  // create form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [shared, setShared] = useState(false);

  // edit state
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDeadline, setEditDeadline] = useState("");
  const [editShared, setEditShared] = useState(false);

  // view state
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("deadline");

  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  const isOverdue = (todo) => {
    if (!todo.deadline) return false;
    return !todo.completed && new Date(todo.deadline) < today;
  };

  const total = todos.length;
  const completedCount = todos.filter((t) => t.completed).length;
  const archivedCount = todos.filter((t) => t.archived).length;
  const activeCount = total - completedCount - archivedCount;
  const overdueCount = todos.filter(isOverdue).length;

  const canShare = Boolean(currentUser?.workspace);

  /* ================= FETCH TODOS ================= */
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await waitForAuthInit();
      const token = await getAuthToken();
      if (!token) {
        setCurrentUser(null);
        setTodos([]);
        setLoading(false);
        return;
      }

      fetchTodos()
        .then(setTodos)
        .catch(() => setError("Unable to load todos. Please try again."))
        .finally(() => setLoading(false));

      api
        .get("/auth/me")
        .then((res) => setCurrentUser(res.data.user))
        .catch(() => setCurrentUser(null));
    };

    loadData();
  }, []);

  /* ================= CREATE TODO ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !description.trim()) {
      setError("Please fill in the task name and details before adding.");
      return;
    }

    try {
      const shareValue = canShare ? shared : false;
      const createdTodo = await createTodo({
        name: name.trim(),
        description: description.trim(),
        deadline,
        visibility: shareValue ? "workspace" : "private",
      });

      setTodos((prev) => [createdTodo, ...prev]);

      setName("");
      setDescription("");
      setDeadline("");
      setShared(false);
    } catch (err) {
      setError(err.response?.data?.message || "Could not create todo.");
    }
  };

  /* ================= DELETE TODO ================= */
  const handleDelete = async (id) => {
    try {
      await deleteTodo(id);
      setTodos((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete todo.");
    }
  };

  /* ================= EDIT TODO ================= */
  const handleEdit = (todo) => {
    setEditingId(todo._id);
    setEditName(todo.name);
    setEditDescription(todo.description);
    setEditDeadline(todo.deadline ? todo.deadline.split("T")[0] : "");
    setEditShared(todo.visibility === "workspace" || Boolean(todo.shared));
  };

  const handleSave = async (id) => {
    if (!editName.trim() || !editDescription.trim()) {
      setError("Please complete the task name and details before saving.");
      return;
    }

    const shareValue = canShare ? editShared : false;
    const updatedTodo = {
      name: editName.trim(),
      description: editDescription.trim(),
      deadline: editDeadline || null,
      visibility: shareValue ? "workspace" : "private",
    };

    try {
      const updated = await updateTodo(id, updatedTodo);
      setTodos((prev) =>
        prev.map((t) => (t._id === id ? { ...t, ...updated } : t))
      );
      setEditingId(null);
    } catch (err) {
      setError(err.response?.data?.message || "Could not update todo.");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  /* ================= TOGGLE COMPLETE ================= */
  const handleToggle = async (todo) => {
    const updatedTodo = { completed: !todo.completed };

    try {
      const updated = await updateTodo(todo._id, updatedTodo);
      setTodos((prev) =>
        prev.map((t) => (t._id === todo._id ? { ...t, ...updated } : t))
      );
    } catch (err) {
      setError(err.response?.data?.message || "Could not update todo.");
    }
  };

  const query = search.trim().toLowerCase();
  let filteredTodos = todos.filter((todo) => {
    const matchesQuery =
      !query ||
      todo.name.toLowerCase().includes(query) ||
      todo.description.toLowerCase().includes(query);

    if (!matchesQuery) return false;

    if (filter === "all") return !todo.archived;
    if (filter === "completed") return todo.completed && !todo.archived;
    if (filter === "active") return !todo.completed && !todo.archived;
    if (filter === "archived") return todo.archived;
    if (filter === "overdue") return isOverdue(todo);
    return true;
  });

  let visibleTodos = [...filteredTodos].sort((a, b) => {
    if (sort === "name") return a.name.localeCompare(b.name);
    if (sort === "created") return new Date(b.createdAt) - new Date(a.createdAt);
    const aDate = a.deadline ? new Date(a.deadline) : new Date(8640000000000000);
    const bDate = b.deadline ? new Date(b.deadline) : new Date(8640000000000000);
    return aDate - bDate;
  });

  const formatDate = (date) => {
    if (!date) return "No deadline";
    const parsed = new Date(date);
    return parsed.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Workspace</p>
          <h1 className="font-display text-3xl font-semibold">Your Buddy Progress Board</h1>
          <p className="mt-2 text-sm text-slate-600">
            Track personal work and shared tasks so buddies can see each other’s progress.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl bg-white/80 p-4 shadow-sm">
            <p className="text-xs uppercase text-slate-500">Total</p>
            <p className="font-display text-2xl font-semibold">{total}</p>
          </div>
          <div className="rounded-2xl bg-white/80 p-4 shadow-sm">
            <p className="text-xs uppercase text-slate-500">Active</p>
            <p className="font-display text-2xl font-semibold">{activeCount}</p>
          </div>
          <div className="rounded-2xl bg-white/80 p-4 shadow-sm">
            <p className="text-xs uppercase text-slate-500">Completed</p>
            <p className="font-display text-2xl font-semibold text-emerald-600">{completedCount}</p>
          </div>
          <div className="rounded-2xl bg-white/80 p-4 shadow-sm">
            <p className="text-xs uppercase text-slate-500">Archived</p>
            <p className="font-display text-2xl font-semibold text-slate-600">{archivedCount}</p>
          </div>
        </div>
      </div>

      <div className="card-shell rounded-3xl p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold">Add a new task</h2>
            <p className="text-sm text-slate-500">Keep tasks crisp so your buddies can follow the flow.</p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-slate-500" />
        </div>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-3 md:grid-cols-6">
          <div className="md:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Task</label>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="Sprint retro notes"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="md:col-span-3">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Description</label>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="Prep weekly sync notes for the crew"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="md:col-span-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Deadline (optional)</label>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
          <div className="md:col-span-6 flex items-center gap-3 text-sm text-slate-600">
            <input
              id="share-task"
              type="checkbox"
              checked={shared}
              onChange={(e) => setShared(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
              disabled={!canShare}
            />
            <label htmlFor="share-task">
              {canShare ? "Share this task with my workspace" : "Join a workspace to share tasks"}
            </label>
          </div>
          <div className="md:col-span-6 flex flex-wrap items-center justify-between gap-3">
            <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
              Add task
            </button>
            {error && (
              <span className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600">
                {error}
              </span>
            )}
          </div>
        </form>
      </div>

      <div className="card-shell rounded-3xl p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold">Task list</h2>
            <p className="text-sm text-slate-500">Filter, archive, and keep your buddy crew in sync.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.map((item) => (
              <button
                key={item.value}
                onClick={() => setFilter(item.value)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  filter === item.value
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <input
            className="w-full md:max-w-sm rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            placeholder="Search tasks"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">Sort</span>
            <select
              className="rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {loading && (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-6 text-sm text-slate-500">
              Loading tasks...
            </div>
          )}

          {!loading && visibleTodos.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-6 text-sm text-slate-500">
              No tasks match this view. Try adjusting filters or add a new task.
            </div>
          )}

          {visibleTodos.map((todo) => {
            const currentId = currentUser?._id || currentUser?.id;
            const ownerId = todo.user?._id || todo.user;
            const isOwner = currentId ? String(ownerId) === String(currentId) : true;
            const isArchived = Boolean(todo.archived);

            const cardTone = todo.archived
              ? "bg-slate-100"
              : todo.completed
                ? "bg-emerald-50/80"
                : isOverdue(todo)
                  ? "bg-rose-50/80"
                  : "bg-white/80";

            return (
              <div key={todo._id} className={`rounded-2xl border border-slate-200 p-4 shadow-sm ${cardTone}`}>
                {editingId === todo._id ? (
                  <div className="grid gap-3 md:grid-cols-6">
                    <div className="md:col-span-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Task</label>
                      <input
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Description</label>
                      <input
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Deadline (optional)</label>
                      <input
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        type="date"
                        value={editDeadline}
                        onChange={(e) => setEditDeadline(e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-6 flex items-center gap-3 text-sm text-slate-600">
                      <input
                        id={`share-edit-${todo._id}`}
                        type="checkbox"
                        checked={editShared}
                        onChange={(e) => setEditShared(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300"
                        disabled={!canShare}
                      />
                      <label htmlFor={`share-edit-${todo._id}`}>
                        {canShare ? "Shared with workspace" : "Join a workspace to share tasks"}
                      </label>
                    </div>
                    <div className="md:col-span-6 flex flex-wrap gap-2">
                      <button onClick={() => handleSave(todo._id)} className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-500">
                        Save changes
                      </button>
                      <button onClick={handleCancel} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-500 hover:border-slate-300">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => isOwner && handleToggle(todo)}
                        disabled={!isOwner}
                        className={`mt-1 h-5 w-5 rounded-md border ${todo.completed ? "bg-emerald-500 border-emerald-500" : "border-slate-300"} ${!isOwner ? "opacity-60 cursor-not-allowed" : ""}`}
                        aria-label="Toggle completion"
                      />
                      <div>
                        <div className={`font-semibold ${todo.completed ? "line-through text-emerald-600 opacity-70" : "text-slate-900"}`}>
                          {todo.name}
                        </div>
                        <div className="text-sm text-slate-600">{todo.description}</div>
                        {!isOwner && (
                          <div className="text-xs text-slate-500">Shared by {todo.user?.name || "Teammate"}</div>
                        )}
                        <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-500">
                            {todo.deadline ? `Due ${formatDate(todo.deadline)}` : "No deadline"}
                          </span>
                          {todo.completed && (
                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">✅ Completed</span>
                          )}
                          {!todo.completed && isOverdue(todo) && (
                            <span className="rounded-full bg-rose-100 px-3 py-1 text-rose-700">Overdue</span>
                          )}
                          {isArchived && (
                            <span className="rounded-full bg-slate-200 px-3 py-1 text-slate-600">Archived</span>
                          )}
                          {(todo.visibility === "workspace" || todo.shared) && (
                            <span className="rounded-full bg-indigo-100 px-3 py-1 text-indigo-700">Shared</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3 text-xs font-semibold text-slate-500">
                      {isOwner ? (
                        <>
                          <button onClick={() => handleEdit(todo)} className="btn-ghost">Edit</button>
                          <button
                            onClick={() =>
                              updateTodo(todo._id, { archived: !todo.archived })
                                .then((updated) =>
                                  setTodos((prev) =>
                                    prev.map((t) => (t._id === todo._id ? { ...t, ...updated } : t))
                                  )
                                )
                                .catch((err) =>
                                  setError(err.response?.data?.message || "Could not update todo.")
                                )
                            }
                            className="btn-ghost"
                          >
                            {todo.archived ? "Unarchive" : "Archive"}
                          </button>
                          <button onClick={() => handleDelete(todo._id)} className="btn-ghost text-rose-600 hover:text-rose-700">Delete</button>
                        </>
                      ) : (
                        <span className="text-slate-400">View only</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TodoPage;
