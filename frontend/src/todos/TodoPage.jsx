import { useEffect, useState } from "react";
import {
  fetchTodos,
  createTodo,
  deleteTodo,
  updateTodo,
} from "../api/todo.api";

const TodoPage = () => {
  const [todos, setTodos] = useState([]);

  // create form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");

  // edit state
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDeadline, setEditDeadline] = useState("");

  /* ================= FETCH TODOS ================= */
  useEffect(() => {
    fetchTodos()
      .then(setTodos)
      .catch((err) => console.error("Error fetching todos:", err));
  }, []);

  /* ================= CREATE TODO ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !description || !deadline) return;

    const createdTodo = await createTodo({
      name,
      description,
      deadline,
    });

    setTodos((prev) => [createdTodo, ...prev]);

    setName("");
    setDescription("");
    setDeadline("");
  };

  /* ================= DELETE TODO ================= */
  const handleDelete = async (id) => {
    await deleteTodo(id);
    setTodos((prev) => prev.filter((t) => t._id !== id));
  };

  /* ================= EDIT TODO ================= */
  const handleEdit = (todo) => {
    setEditingId(todo._id);
    setEditName(todo.name);
    setEditDescription(todo.description);
    setEditDeadline(todo.deadline.split("T")[0]);
  };

  const handleSave = async (id) => {
    const updatedTodo = {
      name: editName,
      description: editDescription,
      deadline: editDeadline,
    };

    await updateTodo(id, updatedTodo);

    setTodos((prev) =>
      prev.map((t) => (t._id === id ? { ...t, ...updatedTodo } : t))
    );

    setEditingId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  /* ================= TOGGLE COMPLETE ================= */
  const handleToggle = async (todo) => {
    const updatedTodo = { completed: !todo.completed };

    await updateTodo(todo._id, updatedTodo);

    setTodos((prev) =>
      prev.map((t) =>
        t._id === todo._id ? { ...t, ...updatedTodo } : t
      )
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Todo List</h1>

      {/* CREATE FORM */}
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-6 grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
        <input
          className="col-span-1 md:col-span-1 px-3 py-2 border rounded"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="col-span-1 md:col-span-2 px-3 py-2 border rounded"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          className="col-span-1 px-3 py-2 border rounded"
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />
        <div className="md:col-span-4">
          <button type="submit" className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add Todo</button>
        </div>
      </form>

      {/* TODO LIST */}
      <ul className="space-y-3">
        {todos.map((todo) => (
          <li key={todo._id} className="bg-white p-4 rounded shadow flex items-start justify-between">
            {editingId === todo._id ? (
              <div className="flex-1">
                <div className="space-y-2">
                  <input
                    className="w-full px-3 py-2 border rounded"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                  <input
                    className="w-full px-3 py-2 border rounded"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                  />
                  <input
                    className="px-3 py-2 border rounded"
                    type="date"
                    value={editDeadline}
                    onChange={(e) => setEditDeadline(e.target.value)}
                  />
                </div>
                <div className="mt-2 space-x-2">
                  <button onClick={() => handleSave(todo._id)} className="bg-green-600 text-white px-3 py-1 rounded">Save</button>
                  <button onClick={handleCancel} className="bg-gray-200 px-3 py-1 rounded">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => handleToggle(todo)}
                  className="mt-1 h-4 w-4"
                />

                <div>
                  <div className={`font-semibold ${todo.completed ? 'line-through text-green-600 opacity-60' : ''}`}>
                    {todo.name}
                  </div>
                  <div className="text-sm text-gray-600">{todo.description}</div>
                  <div className="text-xs text-gray-400">{new Date(todo.deadline).toLocaleDateString()}</div>
                </div>
              </div>
            )}

            <div className="ml-4 shrink-0 flex flex-col gap-2">
              {!editingId && (
                <>
                  <button onClick={() => handleEdit(todo)} className="text-sm text-blue-600 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(todo._id)} className="text-sm text-red-600 hover:underline">Delete</button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodoPage;
