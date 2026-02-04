import { useEffect, useState } from "react";
import { fetchAdminUsers } from "../api/admin.api";

const AdminPage = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchAdminUsers()
      .then(setUsers)
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>

      <div className="space-y-4">
        {users.map((user) => (
          <div key={user._id} className="bg-white rounded shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{user.name}</h3>
                <div className="text-sm text-gray-600">{user.email} • {user.role}</div>
              </div>
            </div>

            <ul className="mt-3 space-y-1">
              {user.todos.map((todo) => (
                <li key={todo._id} className="text-sm">
                  {todo.name} — {todo.completed ? "✅" : "❌"}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPage;
