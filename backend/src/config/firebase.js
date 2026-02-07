import admin from "firebase-admin";

let firebaseApp;

export const getFirebaseAdmin = () => {
  if (firebaseApp) return admin;

  const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccountRaw) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT is not set");
  }

  let serviceAccount;
  try {
    serviceAccount = JSON.parse(serviceAccountRaw);
  } catch (err) {
    const normalized = serviceAccountRaw.replace(/\n/g, "\\n");
    serviceAccount = JSON.parse(normalized);
  }

  if (serviceAccount.private_key?.includes("\\n")) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
  }

  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  return admin;
};
