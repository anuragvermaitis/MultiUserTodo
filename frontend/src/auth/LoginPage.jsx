import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword, signInWithPopup, sendPasswordResetEmail, sendEmailVerification, signOut } from "firebase/auth";
import { auth, googleProvider } from "./firebase";
import { storeToken, clearToken } from "./authSession";
import api from "../api/client";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [resetSent, setResetSent] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (auth.currentUser?.emailVerified) {
            navigate("/todos");
        } else if (auth.currentUser && !auth.currentUser.emailVerified) {
            signOut(auth);
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setResetSent(false);
        try {
            setLoading(true);
            const credential = await signInWithEmailAndPassword(auth, email, password);
            if (!credential.user.emailVerified) {
                await sendEmailVerification(credential.user);
                await signOut(auth);
                setError("Email not verified. We sent a new verification link.");
                return;
            }
            const token = await credential.user.getIdToken(true);
            storeToken(token);
            try {
                await api.post("/auth/login");
            } catch (apiErr) {
                clearToken();
                await signOut(auth);
                throw apiErr;
            }
            navigate("/todos");
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogle = async () => {
        setError("");
        setResetSent(false);
        try {
            setLoading(true);
            const credential = await signInWithPopup(auth, googleProvider);
            if (!credential.user.emailVerified) {
                await sendEmailVerification(credential.user);
                await signOut(auth);
                setError("Email not verified. We sent a new verification link.");
                return;
            }
            const token = await credential.user.getIdToken(true);
            storeToken(token);
            try {
                await api.post("/auth/login");
            } catch (apiErr) {
                clearToken();
                await signOut(auth);
                throw apiErr;
            }
            navigate("/todos");
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Google sign-in failed");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        setError("");
        setResetSent(false);
        if (!email.trim()) {
            setError("Enter your email first so we can send the reset link.");
            return;
        }
        try {
            setLoading(true);
            await sendPasswordResetEmail(auth, email.trim());
            setResetSent(true);
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Could not send reset email.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
            <div className="w-full max-w-md card-shell rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 rounded-2xl bg-linear-to-br from-indigo-500 via-blue-500 to-sky-400" />
                    <div>
                        <h2 className="font-display text-2xl font-semibold">Welcome back</h2>
                        <p className="text-sm text-slate-500">Sign in to continue.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</label>
                        <input
                            className="mt-2 w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                            placeholder="dev@localhost.dev"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Password</label>
                        <input
                            className="mt-2 w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                            type="password"
                            placeholder="correcthorsebatterystaple"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full rounded-xl bg-slate-900 text-white py-2 text-sm font-semibold shadow-lg shadow-slate-900/20 hover:bg-slate-800 disabled:opacity-60"
                        disabled={loading}
                    >
                        {loading ? "Signing in..." : "Login"}
                    </button>
                </form>

                <div className="my-3 flex items-center gap-3 text-xs text-slate-400">
                    <div className="h-px flex-1 bg-slate-200/70" />
                    or
                    <div className="h-px flex-1 bg-slate-200/70" />
                </div>

                <button
                    type="button"
                    onClick={handleGoogle}
                    className="btn-google w-full rounded-xl py-2 text-sm font-semibold disabled:opacity-60"
                    disabled={loading}
                >
                    Continue with Google
                </button>

                <button
                    type="button"
                    onClick={handleResetPassword}
                    className="mt-2 text-xs font-semibold text-slate-500 hover:text-slate-900"
                    disabled={loading}
                >
                    Forgot password? Send reset link
                </button>

                {resetSent && (
                    <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                        Reset link sent. Check your email.
                    </p>
                )}

                {error && (
                    <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>
                )}

                <p className="mt-6 text-sm text-slate-600">
                    Don’t have an account?{" "}
                    <Link className="text-indigo-600 hover:underline" to="/register">
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
