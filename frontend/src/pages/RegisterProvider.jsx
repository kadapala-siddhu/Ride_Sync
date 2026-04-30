import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerProvider } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import Notification from "../components/Notification";

// Format: 2 letters + 2 digits + 2 letters + 4 digits  e.g. TS09AB1234
const VEHICLE_NUM_REGEX = /^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/i;

const RegisterProvider = () => {
  const { loginCtx } = useAuth();
  const navigate = useNavigate();
  const [notif,   setNotif]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [vehicleNumTouched, setVehicleNumTouched] = useState(false);

  const [form, setForm] = useState({
    firstName: "", lastName: "", age: "", mobile: "", email: "",
    password: "", confirmPassword: "", gender: "",
    vehicleType: "bike", vehicleNumber: "", seats: "", license: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "vehicleNumber") setVehicleNumTouched(true);
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Client-side vehicle number check before hitting server
    if (!VEHICLE_NUM_REGEX.test(form.vehicleNumber?.trim())) {
      setVehicleNumTouched(true);
      setNotif({ message: "Invalid vehicle number format. Use: 2 letters + 2 digits + 2 letters + 4 digits (e.g. TS09AB1234)", type: "error" });
      return;
    }
    setLoading(true);
    try {
      const payload = { ...form, age: Number(form.age) };
      if (form.vehicleType === "bike") payload.seats = 1;
      const res = await registerProvider(payload);
      loginCtx(res.data);
      setNotif({ message: "Welcome, Driver! Account created 🚗", type: "success" });
      setTimeout(() => navigate("/dashboard"), 1400);
    } catch (err) {
      setNotif({ message: err.response?.data?.message || "Registration failed", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center py-12 px-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-primary-600/15 rounded-full blur-3xl pointer-events-none" />

      {notif && <Notification message={notif.message} type={notif.type} onClose={() => setNotif(null)} />}

      <div className="w-full max-w-2xl glass-card p-8 animate-slide-up border border-primary-500/20">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mx-auto mb-4 shadow-glow">
            <span className="text-2xl">🚗</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Ride Provider Signup</h1>
          <p className="text-white/50 mt-1 text-sm">Register as a driver and offer rides to your college mates</p>
          <span className="inline-flex items-center mt-3 px-3 py-1 rounded-full text-xs font-semibold bg-primary-500/20 text-primary-400 border border-primary-500/30">
            🚗 Driver Account
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

          {/* Age, Gender */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Age (must be ≥ 18)</label>
              <input name="age" type="number" min="18" value={form.age} onChange={handleChange}
                placeholder="22" required className="input-field" />
            </div>
            <div>
              <label className="label">Gender</label>
              <select name="gender" value={form.gender} onChange={handleChange} required className="input-field">
                <option value="" disabled>Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
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

          {/* Vehicle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Vehicle Type</label>
              <select name="vehicleType" value={form.vehicleType} onChange={handleChange} className="input-field">
                <option value="bike">Bike 🏍️</option>
                <option value="car">Car 🚗</option>
              </select>
            </div>
            <div>
              <label className="label">Vehicle Number</label>
              <input
                name="vehicleNumber"
                value={form.vehicleNumber}
                onChange={handleChange}
                placeholder="e.g. TS09AB1234"
                maxLength={10}
                required
                className={`input-field uppercase ${
                  vehicleNumTouched && !VEHICLE_NUM_REGEX.test(form.vehicleNumber?.trim())
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                    : vehicleNumTouched && VEHICLE_NUM_REGEX.test(form.vehicleNumber?.trim())
                    ? "border-primary-500 focus:border-primary-500"
                    : ""
                }`}
              />
              {/* Live validation hint */}
              {vehicleNumTouched && !VEHICLE_NUM_REGEX.test(form.vehicleNumber?.trim()) ? (
                <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                  <span>✗</span> Must be: 2 letters + 2 digits + 2 letters + 4 digits (e.g. TS09AB1234)
                </p>
              ) : vehicleNumTouched && VEHICLE_NUM_REGEX.test(form.vehicleNumber?.trim()) ? (
                <p className="text-xs text-primary-400 mt-1 flex items-center gap-1">
                  <span>✓</span> Valid vehicle number
                </p>
              ) : (
                <p className="text-xs text-slate-500 mt-1">Format: AA00AA0000 (e.g. TS09AB1234)</p>
              )}
            </div>
          </div>

          {/* Car seats */}
          {form.vehicleType === "car" && (
            <div>
              <label className="label">Total Car Seats (2–8)</label>
              <input name="seats" type="number" min="2" max="8" value={form.seats} onChange={handleChange}
                placeholder="4" required className="input-field" />
            </div>
          )}

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

          {/* License toggle */}
          <div className="bg-white/3 border border-white/10 rounded-xl p-4">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`relative w-11 h-6 rounded-full transition-all duration-200 ${form.license ? "bg-primary-500" : "bg-white/10"}`}>
                <input type="checkbox" name="license" checked={form.license} onChange={handleChange} className="sr-only" />
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${form.license ? "translate-x-5" : ""}`} />
              </div>
              <div>
                <p className="text-sm text-white font-medium">I have a valid driving license</p>
                <p className="text-xs text-white/40">Required to offer rides on RideSync</p>
              </div>
            </label>
            {!form.license && (
              <p className="text-yellow-400 text-xs mt-3 flex gap-2">
                <span>⚠️</span>
                <span>A valid license is mandatory to register as a Ride Provider.</span>
              </p>
            )}
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Creating Driver Account…" : "Create Driver Account →"}
          </button>

          <p className="text-center text-white/50 text-sm">
            Looking for a ride instead?{" "}
            <Link to="/register/seeker" className="text-accent-400 hover:text-accent-300 font-medium transition-colors">
              Join as a Passenger
            </Link>
          </p>
          <p className="text-center text-white/30 text-xs">
            Already have an account?{" "}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 transition-colors">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterProvider;
