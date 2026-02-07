import api from "./client";
import { routes } from "./routes";

export const fetchWorkspace = async () => {
  const res = await api.get(routes.workspace.me);
  return res.data.data;
};

export const createWorkspace = async (name) => {
  const res = await api.post(routes.workspace.root, { name });
  return res.data.data;
};

export const joinWorkspace = async (code) => {
  const res = await api.post(routes.workspace.join, { code });
  return res.data.data;
};

export const refreshInviteCode = async () => {
  const res = await api.post(routes.workspace.invite);
  return res.data.data;
};

export const leaveWorkspace = async () => {
  await api.post(routes.workspace.leave);
};

export const transferWorkspaceOwner = async (userId) => {
  const res = await api.post(routes.workspace.transfer, { userId });
  return res.data.data;
};

export const deleteWorkspace = async () => {
  await api.delete(routes.workspace.root);
};

export const updateWorkspaceName = async (name) => {
  const res = await api.patch(routes.workspace.root, { name });
  return res.data.data;
};
