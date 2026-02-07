import api from "./client";
import { routes } from "./routes";

export const fetchAdminUsers = async () => {
  const res = await api.get(routes.admin.users);
  return res.data.data;
};

export const fetchTeamUsers = async () => {
  const res = await api.get(routes.team.users);
  return res.data.data;
};

export const updateUserRole = async (id, role) => {
  const res = await api.patch(routes.admin.userRole(id), { role });
  return res.data.data;
};

export const removeMember = async (id) => {
  await api.delete(routes.admin.removeUser(id));
};

export const upsertMemberNote = async (id, text) => {
  const res = await api.post(routes.team.note(id), { text });
  return res.data.data;
};
