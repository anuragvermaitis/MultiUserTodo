import { getFirebaseAdmin } from "../config/firebase.js";
import { createAppUser, findUserByFirebaseUidOrEmail } from "../services/appUser.service.js";

const getTokenFromRequest = (req) => {
  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ")) return header.split(" ")[1];
  if (req.body?.token) return req.body.token;
  return null;
};

export const signup = async (req, res) => {
  try {
    const { email, password, name } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const admin = getFirebaseAdmin();
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name || email.split("@")[0],
    });

    let verificationLink = null;
    if (process.env.NODE_ENV !== "production" && process.env.EXPOSE_VERIFICATION_LINK === "true") {
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      const actionCodeSettings = { url: frontendUrl, handleCodeInApp: false };
      verificationLink = await admin.auth().generateEmailVerificationLink(email, actionCodeSettings);
    }

    const response = {
      message: "Signup successful. Verify your email to activate your account.",
      firebaseUid: userRecord.uid,
    };

    if (verificationLink) {
      response.verificationLink = verificationLink;
    }

    return res.status(201).json(response);
  } catch (err) {
    return res.status(400).json({ message: err.message || "Signup failed" });
  }
};

export const login = async (req, res) => {
  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({ message: "Missing token" });
    }

    const admin = getFirebaseAdmin();
    const decoded = await admin.auth().verifyIdToken(token);

    const email = decoded.email?.toLowerCase() || null;
    const firebaseUid = decoded.uid;

    let user = await findUserByFirebaseUidOrEmail({ firebaseUid, email });

    if (!user) {
      if (email && !decoded.email_verified) {
        return res.status(403).json({ message: "Verify email first" });
      }

      const name = decoded.name || decoded.phone_number || email?.split("@")[0] || "User";
      user = await createAppUser({ firebaseUid, email, name, role: "user" });
    } else if (!user.firebaseUid) {
      user.firebaseUid = firebaseUid;
      await user.save();
    }

    if (user.isActive === false) {
      return res.status(403).json({ message: "User not activated" });
    }

    return res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        workspace: user.workspace,
        isActive: user.isActive,
      },
    });
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const getMe = async (req, res) => {
  if (!req.user) {
    return res.status(200).json({ user: null });
  }

  return res.status(200).json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      workspace: req.user.workspace,
      isActive: req.user.isActive,
    },
  });
};
