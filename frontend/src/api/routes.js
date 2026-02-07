export const routes = {
  auth: {
    login: "/auth/login",
    signup: "/auth/signup",
  },
  todos: {
    root: "/todos",
    byId: (id) => `/todos/${id}`,
  },
  admin: {
    users: "/admin/users",
    userRole: (id) => `/admin/users/${id}/role`,
    removeUser: (id) => `/admin/users/${id}`,
  },
  team: {
    users: "/team/users",
    note: (id) => `/team/users/${id}/note`,
  },
  workspace: {
    root: "/workspaces",
    me: "/workspaces/me",
    join: "/workspaces/join",
    invite: "/workspaces/invite",
    leave: "/workspaces/leave",
    transfer: "/workspaces/transfer",
  },
};
