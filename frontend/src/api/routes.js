export const routes = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
  },
  todos: {
    root: "/todos",
    byId: (id) => `/todos/${id}`,
  },
};
