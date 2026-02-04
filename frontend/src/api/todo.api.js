import api from "./client";
import { routes } from "./routes";

export const fetchTodos = async () => {
  const res = await api.get(routes.todos.root);
  return res.data.data;
};

export const createTodo = async (todo) => {
  const res = await api.post(routes.todos.root, todo);
  return res.data.data;
};

export const deleteTodo = async (id) => {
  await api.delete(routes.todos.byId(id));
};

export const updateTodo = async (id, updatedTodo) => {
  const res = await api.put(routes.todos.byId(id), updatedTodo);
  return res.data.data;
};
