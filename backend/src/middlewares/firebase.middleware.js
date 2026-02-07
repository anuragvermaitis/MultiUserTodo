import User from "../models/user.model.js";
import { getFirebaseAdmin } from "../config/firebase.js";
import { findUserByFirebaseUidOrEmail } from "../services/appUser.service.js";

const resolveAppUser = async (decoded) => {
  const firebaseUid = decoded.uid;
  const email = decoded.email?.toLowerCase() || null;
  let user = await findUserByFirebaseUidOrEmail({ firebaseUid, email });

  if (user && !user.firebaseUid) {
    user.firebaseUid = firebaseUid;
    await user.save();
  }

  return user;
};

export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const admin = getFirebaseAdmin();
    const decoded = await admin.auth().verifyIdToken(token);

    const user = await resolveAppUser(decoded);
    if (!user || user.isActive === false) {
      return res.status(403).json({ message: "User not activated" });
    }

    req.user = user;
    req.firebase = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const optionalProtect = async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    req.user = null;
    req.firebase = null;
    return next();
  }

  try {
    const admin = getFirebaseAdmin();
    const decoded = await admin.auth().verifyIdToken(token);
    const user = await resolveAppUser(decoded);

    req.user = user || null;
    req.firebase = decoded;
    return next();
  } catch (err) {
    req.user = null;
    req.firebase = null;
    return next();
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  };
};
