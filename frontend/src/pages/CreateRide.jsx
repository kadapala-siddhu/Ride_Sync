import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createRide } from "../services/rideService";
import { useAuth }    from "../context/AuthContext";
import Notification   from "../components/Notification";
import { getAllUniqueStops, getPossibleDestinations } from "../utils/routesData";

const CreateRide = () => {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const [notif,   setNotif]   = useState(null);
  const [loading, setLoading] = useState(false);
  const stops = getAllUniqueStops();

  // vehicleType comes from user's registered profile — no need to ask again
  const isBike = user?.vehicleType === "bike";
  const defaultSeats = isBike ? "1" : String((user?.seats || 4) - 1);

  const [form, setForm] = useState({
    origin:      "",
    destination: "",
    time:        "",
    totalSeats:  defaultSeats,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "origin") {
      setForm((p) => ({ ...p, origin: value, destination: "" }));
    } else {
      setForm((p) => ({ ...p, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // vehicleType is NOT sent — backend reads it from the user's profile
      await createRide({ ...form, totalSeats: Number(form.totalSeats) });
      setNotif({ message: "Ride posted successfully! 🚀", type: "success" });
      setTimeout(() => navigate("/my-rides"), 1500);
    } catch (err) {
      setNotif({ message: err.response?.data?.message || "Failed to create ride", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6">
      {notif && <Notification message={notif.message} type={notif.type} onClose={() => setNotif(null)} />}

      <div className="max-w-xl mx-auto animate-slide-up">
        {/* Header */}
        <div className="mb-7">
          <h1 className="text-3xl font-bold text-white">Create a Ride</h1>
          <p className="text-slate-400 mt-1 text-sm">Offer a ride to your fellow students</p>

          {/* Vehicle info from profile — no need to re-enter */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className="inline-flex items-center gap-1.5 bg-dark-800 border border-dark-700 px-3 py-1.5 rounded-lg text-xs text-slate-300">
              {isBike ? "🏍️" : "🚗"} {user?.vehicleType === "bike" ? "Bike" : "Car"}
              {user?.vehicleNumber && <span className="font-semibold text-slate-200 uppercase">· {user.vehicleNumber}</span>}
            </span>
            <span className="inline-flex items-center gap-1 bg-emerald-900/60 border border-emerald-800 px-3 py-1.5 rounded-lg text-xs text-emerald-400">
              ✅ Licensed Driver
            </span>
          </div>
        </div>

        <div className="glass-card p-7">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Origin / Destination */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">From</label>
                <select name="origin" value={form.origin} onChange={handleChange} required className="input-field">
                  <option value="" disabled>Select Origin</option>
                  {stops.map(stop => <option key={stop} value={stop}>{stop}</option>)}
                </select>
              </div>
              <div>
                <label className="label">To</label>
                <select name="destination" value={form.destination} onChange={handleChange} required className="input-field" disabled={!form.origin}>
                  <option value="" disabled>{form.origin ? "Select Destination" : "Select Origin first"}</option>
                  {(form.origin ? getPossibleDestinations(form.origin) : []).map(stop => <option key={stop} value={stop}>{stop}</option>)}
                </select>
              </div>
            </div>

            {/* Date & Time */}
            <div>
              <label className="label">Date & Time</label>
              <input name="time" type="datetime-local" value={form.time} onChange={handleChange}
                required className="input-field" />
            </div>

            {/* Seats */}
            <div>
              <label className="label">Passenger Seats</label>
              {isBike ? (
                <div className="input-field text-slate-500 cursor-not-allowed select-none">
                  1 seat (fixed for bike)
                </div>
              ) : (
                <input name="totalSeats" type="number" min="1" max={user?.seats - 1}
                  value={form.totalSeats} onChange={handleChange}
                  required className="input-field" />
              )}
              <p className="text-xs text-slate-500 mt-1">
                Max {isBike ? 1 : (user?.seats ?? 2) - 1} passenger seat{(!isBike && (user?.seats ?? 2) - 1 !== 1) ? "s" : ""} based on your registered vehicle capacity
              </p>
            </div>

            {/* Preview */}
            <div className="bg-dark-900 border border-dark-700 rounded-lg p-4 space-y-1.5">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Preview</p>
              <div className="flex items-center gap-2 text-sm text-slate-200">
                <span>{isBike ? "🏍️" : "🚗"}</span>
                <span className="text-slate-400">{form.origin || "Origin"}</span>
                <span className="text-slate-600">→</span>
                <span className="text-slate-400">{form.destination || "Destination"}</span>
              </div>
              <p className="text-xs text-slate-500">
                {form.time
                  ? new Date(form.time).toLocaleString("en-IN")
                  : "Pick a date & time"}
                &nbsp;·&nbsp;
                {form.totalSeats} passenger seat{Number(form.totalSeats) !== 1 ? "s" : ""}
                {user?.vehicleNumber && <><span className="uppercase">&nbsp;·&nbsp;{user.vehicleNumber}</span></>}
              </p>
            </div>

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Posting Ride…" : "Post Ride →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateRide;
