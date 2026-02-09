import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithPopup, signOut, updateProfile } from "firebase/auth";
import api from "../api/client";
import { auth, googleProvider } from "./firebase";
import { clearToken } from "./authSession";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    // Registration is handled by Firebase; no automatic login.
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      if (name.trim()) {
        await updateProfile(credential.user, { displayName: name.trim() });
      }
      await sendEmailVerification(credential.user);
      await signOut(auth);
      setVerificationSent(true);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    try {
      setLoading(true);
      const credential = await signInWithPopup(auth, googleProvider);
      const token = await credential.user.getIdToken(true);
      try {
        await api.post("/auth/login", { token });
      } catch (apiErr) {
        clearToken();
        await signOut(auth);
        throw apiErr;
      }
      navigate("/todos");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Google sign-up failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md card-shell rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-12 w-12 rounded-2xl bg-linear-to-br from-emerald-400 via-teal-400 to-sky-400" />
          <div>
            <h2 className="font-display text-2xl font-semibold">Create account</h2>
            <p className="text-sm text-slate-500">Set up your account.</p>
          </div>
        </div>

        {verificationSent && (
          <div className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            Verification email sent. Please verify and then login.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Name</label>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
              placeholder="Alex Morgan"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</label>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
              placeholder="alex@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Password</label>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
              type="password"
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-emerald-600 text-white py-2 text-sm font-semibold hover:bg-emerald-500 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <div className="my-4 flex items-center gap-3 text-xs text-slate-400">
          <div className="h-px flex-1 bg-slate-200" />
          Or
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          className="w-full rounded-xl border border-slate-200 bg-white py-2 text-sm font-semibold text-slate-700 hover:border-slate-300 disabled:opacity-60"
          disabled={loading}
        >
          Continue with Google
        </button>

        {error && <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}

        <p className="mt-6 text-sm text-slate-600">
          Already have an account?{" "}
          <Link className="text-indigo-600 hover:underline" to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
