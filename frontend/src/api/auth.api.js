import api from "./client";
import { routes } from "./routes";

export const login = async (credentials) => {
  const res = await api.post(routes.auth.login, credentials);
  return res.data;
};

export const signup = async (data) => {
  const res = await api.post(routes.auth.signup, data);
  return res.data;
};
