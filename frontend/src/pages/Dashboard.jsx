import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyRides }    from "../services/rideService";
import { getMyBookings } from "../services/bookingService";
import { getAllRides }   from "../services/rideService";

const StatCard = ({ emoji, label, value, color }) => (
  <div className={`glass-card p-5 flex flex-col gap-2 border-l-4 ${color} hover:scale-105 transition-transform duration-300`}>
    <span className="text-3xl">{emoji}</span>
    <p className="text-3xl font-bold text-white">{value}</p>
    <p className="text-sm text-white/50">{label}</p>
  </div>
);

// ─── Provider Dashboard ────────────────────────────────────────────────────
const ProviderDashboard = ({ user }) => {
  const [myRides, setMyRides] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await getMyRides();
      setMyRides(res.data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const active    = myRides.filter((r) => r.status === "active").length;
  const completed = myRides.filter((r) => r.status === "completed").length;
  const full      = myRides.filter((r) => r.status === "full").length;

  const quickLinks = [
    { to: "/create-ride",  icon: "➕", label: "Create a Ride",   desc: "Offer a new ride to students" },
    { to: "/my-rides",     icon: "🗂️",  label: "Manage Rides",   desc: "Edit, complete or delete rides" },
    { to: "/ride-history", icon: "📋", label: "Ride History",    desc: "View all past rides & passengers" },
    { to: "/profile",      icon: "👤", label: "Edit Profile",    desc: "Update your account details" },
  ];

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="glass-card p-7 relative overflow-hidden border-l-4 border-primary-600">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/30 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-16 h-16 rounded-xl bg-primary-700 flex items-center justify-center text-2xl font-bold text-white shrink-0">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <p className="text-white/50 text-sm tracking-wider uppercase">Welcome back</p>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-primary-900/60 text-primary-400 border border-primary-800">
                🚗 Ride Provider
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white mt-1">{user?.firstName} {user?.lastName}</h1>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="bg-dark-700 rounded px-3 py-1 text-xs text-slate-400">
                {user?.vehicleType === "bike" ? "🏍️" : "🚗"} {user?.vehicleType}
                {user?.vehicleNumber && <span className="ml-1 font-semibold text-slate-300 uppercase">· {user.vehicleNumber}</span>}
              </span>
              <span className="bg-white/10 rounded-full px-3 py-1 text-xs text-white/70">
                📧 {user?.email}
              </span>
              <span className="bg-emerald-900/60 border border-emerald-800 rounded px-2.5 py-1 text-xs text-emerald-400">
                ✅ Licensed Driver
              </span>
            </div>
          </div>
          <Link to="/create-ride" className="btn-primary py-2.5 px-6 w-auto text-sm shrink-0">
            + New Ride
          </Link>
        </div>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="glass-card p-5 h-28 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard emoji="🚦" label="Total Rides"     value={myRides.length} color="border-primary-500" />
          <StatCard emoji="✅" label="Active"           value={active}         color="border-emerald-500" />
          <StatCard emoji="🔴" label="Full"             value={full}           color="border-orange-500"  />
          <StatCard emoji="🏁" label="Completed"        value={completed}      color="border-blue-500"    />
        </div>
      )}

      {/* Quick actions */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map(({ to, icon, label, desc }) => (
            <Link key={to} to={to}
              className="glass-card p-5 group hover:border-primary-600 transition-colors duration-200 flex flex-col gap-3"
            >
              <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{icon}</span>
              <div>
                <p className="font-semibold text-slate-200 group-hover:text-primary-400 transition-colors">{label}</p>
                <p className="text-xs text-white/40 mt-1">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent rides */}
      {myRides.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Recent Rides</h2>
            <Link to="/my-rides" className="text-primary-400 hover:text-primary-300 text-sm transition-colors">View all →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myRides.slice(0, 4).map((ride) => (
              <div key={ride._id} className="glass-card p-4 flex items-center gap-4">
                <span className="text-2xl">{ride.vehicleType === "bike" ? "🏍️" : "🚗"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{ride.origin} → {ride.destination}</p>
                   <p className="text-xs text-slate-500 mt-0.5">
                     {new Date(ride.time).toLocaleDateString("en-IN", { dateStyle: "medium" })} · {ride.availableSeats}/{ride.totalSeats} seats
                     {ride.user?.vehicleNumber && <> · <span className="uppercase">{ride.user.vehicleNumber}</span></>}
                   </p>
                </div>
                <span className={`badge-${ride.status}`}>{ride.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Seeker Dashboard ──────────────────────────────────────────────────────
const SeekerDashboard = ({ user }) => {
  const [available, setAvailable] = useState([]);
  const [joined,    setJoined]    = useState([]);
  const [loading,   setLoading]   = useState(true);

  const load = useCallback(async () => {
    try {
      const [avRes, jRes] = await Promise.all([getAllRides(), getMyBookings()]);
      setAvailable(avRes.data);
      setJoined(jRes.data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const completedJoined = joined.filter((b) => b.rideId?.status === "completed").length;

  const quickLinks = [
    { to: "/available-rides", icon: "🔍", label: "Find a Ride",   desc: "Browse all available rides" },
    { to: "/joined-rides",    icon: "🎫", label: "My Bookings",   desc: "View rides you've joined" },
    { to: "/ride-history",    icon: "📋", label: "Ride History",  desc: "See your complete ride log" },
    { to: "/profile",         icon: "👤", label: "Edit Profile",  desc: "Update your account details" },
  ];

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="glass-card p-7 relative overflow-hidden border-l-4 border-accent-600">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-900/20 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-16 h-16 rounded-xl bg-accent-700 flex items-center justify-center text-2xl font-bold text-white shrink-0">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <p className="text-white/50 text-sm tracking-wider uppercase">Welcome back</p>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-orange-900/60 text-orange-400 border border-orange-800">
                🧑‍🤝‍🧑 Ride Seeker
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white mt-1">{user?.firstName} {user?.lastName}</h1>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="bg-white/10 rounded-full px-3 py-1 text-xs text-white/70">📧 {user?.email}</span>
              {user?.handicapped && (
                <span className="bg-blue-900/60 border border-blue-800 rounded px-2.5 py-1 text-xs text-blue-400">
                  ♿ Accessibility Enabled
                </span>
              )}
            </div>
          </div>
          <Link to="/available-rides" className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors duration-200 text-sm shrink-0">
            Find a Ride →
          </Link>
        </div>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="glass-card p-5 h-28 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard emoji="🔍" label="Available Rides"  value={available.length}  color="border-accent-500"   />
          <StatCard emoji="🎫" label="Rides Joined"     value={joined.length}    color="border-primary-500"  />
          <StatCard emoji="🏁" label="Completed"        value={completedJoined}  color="border-blue-500"     />
        </div>
      )}

      {/* Quick actions */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map(({ to, icon, label, desc }) => (
            <Link key={to} to={to}
              className="glass-card p-5 group hover:border-accent-600 transition-colors duration-200 flex flex-col gap-3"
            >
              <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{icon}</span>
              <div>
                <p className="font-semibold text-slate-200 group-hover:text-accent-400 transition-colors">{label}</p>
                <p className="text-xs text-white/40 mt-1">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent bookings */}
      {joined.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Recent Bookings</h2>
            <Link to="/joined-rides" className="text-accent-400 hover:text-accent-300 text-sm transition-colors">View all →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {joined.slice(0, 4).map((booking) => {
              const ride = booking.rideId;
              if (!ride) return null;
              return (
                <div key={booking._id} className="glass-card p-4 flex items-center gap-4">
                  <span className="text-2xl">{ride.vehicleType === "bike" ? "🏍️" : "🚗"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{ride.origin} → {ride.destination}</p>
                    <p className="text-xs text-white/40 mt-0.5">
                      Driver: {ride.user?.firstName} {ride.user?.lastName}
                    </p>
                  </div>
                  <span className={`badge-${ride.status === "completed" ? "completed" : booking.status}`}>
                    {ride.status === "completed" ? "completed" : booking.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main Dashboard ────────────────────────────────────────────────────────
const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {user?.role === "provider"
          ? <ProviderDashboard user={user} />
          : <SeekerDashboard   user={user} />
        }
      </div>
    </div>
  );
};

export default Dashboard;
