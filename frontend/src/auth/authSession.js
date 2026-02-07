import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

const TOKEN_KEY = "taskpulse_token";

export const getStoredToken = () => localStorage.getItem(TOKEN_KEY);

export const storeToken = (token) => {
  if (!token) return;
  localStorage.setItem(TOKEN_KEY, token);
};

export const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

export const waitForAuthInit = () =>
  new Promise((resolve) => {
    if (auth.currentUser) {
      resolve(auth.currentUser);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      unsubscribe();
      resolve(currentUser || null);
    });
  });

export const refreshToken = async () => {
  const user = auth.currentUser;
  if (!user) return null;
  const token = await user.getIdToken(true);
  storeToken(token);
  return token;
};

export const getAuthToken = async () => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    storeToken(token);
    return token;
  }
  const existing = getStoredToken();
  const token = await new Promise((resolve) => {
    let settled = false;
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (settled) return;
      settled = true;
      unsubscribe();
      if (!currentUser) {
        resolve(existing || null);
        return;
      }
      const freshToken = await currentUser.getIdToken();
      resolve(freshToken);
    });
    setTimeout(() => {
      if (settled) return;
      settled = true;
      unsubscribe();
      resolve(existing || null);
    }, 1500);
  });

  if (token) {
    storeToken(token);
  } else {
    clearToken();
  }

  return token;
};
