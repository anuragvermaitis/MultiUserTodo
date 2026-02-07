import User from "../models/user.model.js";

export const findUserByFirebaseUid = (firebaseUid) => {
  if (!firebaseUid) return null;
  return User.findOne({ firebaseUid });
};

export const findUserByEmail = (email) => {
  if (!email) return null;
  return User.findOne({ email: email.toLowerCase() });
};

export const findUserByFirebaseUidOrEmail = async ({ firebaseUid, email }) => {
  const byUid = await findUserByFirebaseUid(firebaseUid);
  if (byUid) return byUid;
  return findUserByEmail(email);
};

export const createAppUser = ({ firebaseUid, email, name, role = "user" }) => {
  return User.create({
    firebaseUid,
    email: email?.toLowerCase(),
    name,
    role,
    isActive: true,
  });
};
