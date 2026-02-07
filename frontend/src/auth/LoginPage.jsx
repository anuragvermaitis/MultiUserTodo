import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword, signInWithPopup, sendPasswordResetEmail, RecaptchaVerifier, signInWithPhoneNumber, sendEmailVerification, signOut } from "firebase/auth";
import { auth, googleProvider } from "./firebase";
import { storeToken } from "./authSession";
import api from "../api/client";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [resetSent, setResetSent] = useState(false);
    const [mode, setMode] = useState("email");
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [confirmation, setConfirmation] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        if (auth.currentUser) {
            navigate("/todos");
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
            await api.post("/auth/login");
            navigate("/todos");
        } catch (err) {
            setError(err.message || "Login failed");
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
            await api.post("/auth/login");
            navigate("/todos");
        } catch (err) {
            setError(err.message || "Google sign-in failed");
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
            setError(err.message || "Could not send reset email.");
        } finally {
            setLoading(false);
        }
    };

    const ensureRecaptcha = () => {
        if (window.recaptchaVerifier) return;
        window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
            size: "normal",
            callback: () => {},
        });
        window.recaptchaVerifier.render();
    };

    const handleSendCode = async () => {
        setError("");
        setResetSent(false);
        if (!phone.trim()) {
            setError("Enter a phone number in international format, e.g. +1 555 123 4567.");
            return;
        }
        try {
            setLoading(true);
            ensureRecaptcha();
            const result = await signInWithPhoneNumber(auth, phone.trim(), window.recaptchaVerifier);
            setConfirmation(result);
        } catch (err) {
            setError(err.message || "Failed to send SMS code.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async () => {
        setError("");
        if (!confirmation) {
            setError("Send the code first.");
            return;
        }
        if (!otp.trim()) {
            setError("Enter the verification code.");
            return;
        }
        try {
            setLoading(true);
            const credential = await confirmation.confirm(otp.trim());
            const token = await credential.user.getIdToken(true);
            storeToken(token);
            await api.post("/auth/login");
            navigate("/todos");
        } catch (err) {
            setError(err.message || "Invalid verification code.");
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
            <div className="w-full max-w-md card-shell rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-12 w-12 rounded-2xl bg-linear-to-br from-indigo-500 via-blue-500 to-sky-400" />
                    <div>
                        <h2 className="font-display text-2xl font-semibold">Welcome back</h2>
                        <p className="text-sm text-slate-500">Sign in to keep your buddy progress in sync.</p>
                    </div>
                </div>

                <div className="mb-6 grid grid-cols-2 gap-2 text-xs font-semibold">
                    {[
                        { id: "email", label: "Email" },
                        { id: "phone", label: "Phone OTP" },
                    ].map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => setMode(item.id)}
                            className={`rounded-full px-3 py-2 transition ${mode === item.id ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                {mode === "email" && (
                    <>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</label>
                                <input
                                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                    placeholder="you@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Password</label>
                                <input
                                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full rounded-xl bg-slate-900 text-white py-2 text-sm font-semibold hover:bg-slate-800 disabled:opacity-60"
                                disabled={loading}
                            >
                                {loading ? "Signing in..." : "Login"}
                            </button>
                        </form>

                        <button
                            type="button"
                            onClick={handleGoogle}
                            className="mt-3 w-full rounded-xl border border-slate-200 bg-white py-2 text-sm font-semibold text-slate-700 hover:border-slate-300 disabled:opacity-60"
                            disabled={loading}
                        >
                            Continue with Google
                        </button>

                        <button
                            type="button"
                            onClick={handleResetPassword}
                            className="mt-3 text-xs font-semibold text-slate-600 hover:text-slate-900"
                            disabled={loading}
                        >
                            Forgot password? Send reset link
                        </button>
                    </>
                )}

                {mode === "phone" && (
                    <div className="space-y-3">
                        <div>
                            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Phone</label>
                            <input
                                className="mt-2 w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                placeholder="+1 555 123 4567"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>
                        <div id="recaptcha-container" className="mt-2" />
                        <button
                            type="button"
                            onClick={handleSendCode}
                            className="w-full rounded-xl border border-slate-200 bg-white py-2 text-sm font-semibold text-slate-700 hover:border-slate-300 disabled:opacity-60"
                            disabled={loading}
                        >
                            Send SMS code
                        </button>
                        <div>
                            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Verification code</label>
                            <input
                                className="mt-2 w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                placeholder="123456"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                            />
                        </div>
                        <button
                            type="button"
                            onClick={handleVerifyCode}
                            className="w-full rounded-xl bg-slate-900 text-white py-2 text-sm font-semibold hover:bg-slate-800 disabled:opacity-60"
                            disabled={loading}
                        >
                            Verify & sign in
                        </button>
                        <p className="text-xs text-slate-500">
                            Note: Firebase free tier limits SMS sends to ~10/day per project unless billing is enabled.
                        </p>
                    </div>
                )}

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
