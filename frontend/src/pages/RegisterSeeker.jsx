import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerSeeker } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import Notification from "../components/Notification";

const RegisterSeeker = () => {
  const { loginCtx } = useAuth();
  const navigate = useNavigate();
  const [notif,   setNotif]   = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    firstName: "", lastName: "", mobile: "", email: "",
    password: "", confirmPassword: "", gender: "", handicapped: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await registerSeeker(form);
      loginCtx(res.data);
      setNotif({ message: "Welcome aboard! Let's find you a ride 🧑‍🤝‍🧑", type: "success" });
      setTimeout(() => navigate("/dashboard"), 1400);
    } catch (err) {
      setNotif({ message: err.response?.data?.message || "Registration failed", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center py-12 px-4 relative overflow-hidden">
      <div className="absolute top-1/4 right-1/3 w-72 h-72 bg-accent-600/15 rounded-full blur-3xl pointer-events-none" />

      {notif && <Notification message={notif.message} type={notif.type} onClose={() => setNotif(null)} />}

      <div className="w-full max-w-xl glass-card p-8 animate-slide-up border border-accent-500/20">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-500 to-accent-700 flex items-center justify-center mx-auto mb-4 shadow-glow-pink">
            <span className="text-2xl">🧑‍🤝‍🧑</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Ride Seeker Signup</h1>
          <p className="text-white/50 mt-1 text-sm">Create your account and find affordable rides to campus</p>
          <span className="inline-flex items-center mt-3 px-3 py-1 rounded-full text-xs font-semibold bg-accent-500/20 text-accent-400 border border-accent-500/30">
            🧑‍🤝‍🧑 Passenger Account
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">First Name</label>
              <input name="firstName" value={form.firstName} onChange={handleChange}
                placeholder="John" required className="input-field" />
            </div>
            <div>
              <label className="label">Last Name</label>
              <input name="lastName" value={form.lastName} onChange={handleChange}
                placeholder="Doe" required className="input-field" />
            </div>
          </div>

          {/* Gender */}
          <div>
            <label className="label">Gender</label>
            <select name="gender" value={form.gender} onChange={handleChange} required className="input-field">
              <option value="" disabled>Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Mobile, Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Mobile Number</label>
              <input name="mobile" value={form.mobile} onChange={handleChange}
                placeholder="9876543210" required className="input-field" />
            </div>
            <div>
              <label className="label">College Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange}
                placeholder="name@srmap.edu.in" required className="input-field" />
              <p className="text-xs text-white/30 mt-1">Accepted: .edu.in · .ac.in · .edu</p>
            </div>
          </div>

          {/* Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Password</label>
              <input name="password" type="password" value={form.password} onChange={handleChange}
                placeholder="Min 6 characters" required className="input-field" />
            </div>
            <div>
              <label className="label">Confirm Password</label>
              <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange}
                placeholder="Repeat password" required className="input-field" />
            </div>
          </div>

          {/* Handicapped toggle */}
          <label className="flex items-center gap-3 cursor-pointer group bg-white/3 border border-white/10 rounded-xl p-4">
            <div className={`relative w-11 h-6 rounded-full transition-all duration-200 ${form.handicapped ? "bg-accent-500" : "bg-white/10"}`}>
              <input type="checkbox" name="handicapped" checked={form.handicapped} onChange={handleChange} className="sr-only" />
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${form.handicapped ? "translate-x-5" : ""}`} />
            </div>
            <div>
              <p className="text-sm text-white font-medium">♿ I need accessibility support</p>
              <p className="text-xs text-white/40">Prefer rides with accessibility accommodations</p>
            </div>
          </label>

          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-primary-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg active:scale-95 disabled:opacity-50">
            {loading ? "Creating Passenger Account…" : "Create Passenger Account →"}
          </button>

          <p className="text-center text-white/50 text-sm">
            Want to offer rides instead?{" "}
            <Link to="/register/provider" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
              Join as a Driver
            </Link>
          </p>
          <p className="text-center text-white/30 text-xs">
            Already have an account?{" "}
            <Link to="/login" className="text-accent-400 hover:text-accent-300 transition-colors">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterSeeker;
