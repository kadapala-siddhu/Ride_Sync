import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import Notification from "../components/Notification";

const Login = () => {
  const { loginCtx } = useAuth();
  const navigate = useNavigate();
  const [notif,   setNotif]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ emailOrMobile: "", password: "" });

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(form);
      loginCtx(res.data);
      const role = res.data.role;
      setNotif({
        message: `Welcome back, ${res.data.firstName}! ${role === "provider" ? "🚗" : "🧑‍🤝‍🧑"}`,
        type: "success",
      });
      setTimeout(() => navigate("/dashboard"), 1200);
    } catch (err) {
      setNotif({ message: err.response?.data?.message || "Login failed", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center px-4">
      {notif && <Notification message={notif.message} type={notif.type} onClose={() => setNotif(null)} />}

      <div className="w-full max-w-sm space-y-6 animate-slide-up">
        {/* Brand */}
        <div className="text-center">
          <div className="w-14 h-14 rounded-xl bg-primary-600 flex items-center justify-center mx-auto mb-4 shadow-glow">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">RideSync</h1>
          <p className="text-slate-400 text-sm">College ride-sharing, made simple</p>
        </div>

        {/* Card */}
        <div className="glass-card p-7">
          <h2 className="text-lg font-semibold text-white mb-5">Sign in to your account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email or Mobile</label>
              <input
                name="emailOrMobile"
                value={form.emailOrMobile}
                onChange={handleChange}
                placeholder="name@srmap.edu.in or 9876543210"
                required
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Your password"
                required
                className="input-field"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary mt-1">
              {loading ? "Signing in…" : "Sign In →"}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-5">
            New to RideSync? Choose your role below.
          </p>
        </div>

        {/* Role links */}
        <div className="grid grid-cols-2 gap-3 text-center">
          <Link to="/register/provider" className="glass-card py-4 px-3 hover:border-primary-600 transition-colors">
            <div className="text-2xl mb-1">🚗</div>
            <p className="text-xs text-slate-400">Register as Driver</p>
          </Link>
          <Link to="/register/seeker" className="glass-card py-4 px-3 hover:border-accent-600 transition-colors">
            <div className="text-2xl mb-1">🧑‍🤝‍🧑</div>
            <p className="text-xs text-slate-400">Register as Passenger</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
