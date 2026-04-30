import { useEffect, useState, useCallback } from "react";
import { getMyBookings } from "../services/bookingService";
import Notification      from "../components/Notification";

const formatDate = (d) =>
  new Date(d).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

const StatusBadge = ({ status }) => {
  const map = { active: "badge-active", full: "badge-full", completed: "badge-completed" };
  return <span className={map[status] || "badge-active"}>{status}</span>;
};

const JoinedRides = () => {
  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [notif,    setNotif]    = useState(null);
  const [filter,   setFilter]   = useState("all"); // all | active | completed

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMyBookings();
      setBookings(res.data);
    } catch {
      setNotif({ message: "Failed to load your bookings", type: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const displayed = bookings.filter((b) => {
    if (filter === "all")       return true;
    if (filter === "active")    return b.rideId?.status === "active" || b.rideId?.status === "full";
    if (filter === "completed") return b.rideId?.status === "completed";
    return true;
  });

  const counts = {
    all:       bookings.length,
    active:    bookings.filter((b) => b.rideId?.status === "active" || b.rideId?.status === "full").length,
    completed: bookings.filter((b) => b.rideId?.status === "completed").length,
  };

  const TABS = [
    { key: "all",       label: "All Bookings" },
    { key: "active",    label: "Upcoming"     },
    { key: "completed", label: "Completed"    },
  ];

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6">
      {notif && <Notification message={notif.message} type={notif.type} onClose={() => setNotif(null)} />}

      <div className="max-w-3xl mx-auto space-y-7">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gradient">My Bookings</h1>
          <p className="text-white/50 mt-1 text-sm">Rides you have joined as a passenger</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-white/5 rounded-xl p-1 w-fit">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2
                ${filter === key
                  ? "bg-accent-600 text-white shadow-lg"
                  : "text-white/50 hover:text-white"
                }`}
            >
              {label}
              <span className={`text-xs rounded-full px-2 py-0.5 ${filter === key ? "bg-white/20" : "bg-white/10"}`}>
                {counts[key]}
              </span>
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => <div key={i} className="glass-card h-32 animate-pulse" />)}
          </div>
        ) : displayed.length === 0 ? (
          <div className="glass-card p-16 text-center">
            <div className="text-6xl mb-4">🎫</div>
            <h3 className="text-xl font-semibold text-white">
              {filter === "all" ? "No Bookings Yet" : `No ${filter} rides`}
            </h3>
            <p className="text-white/50 mt-2 text-sm">
              {filter === "all"
                ? "Browse available rides and join your first one!"
                : "Nothing here right now."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayed.map((booking) => {
              const ride = booking.rideId;
              if (!ride) return null;
              return (
                <div key={booking._id} className="glass-card p-5 flex flex-col sm:flex-row items-start gap-4 hover:border-accent-500/30 transition-all duration-300 animate-fade-in">
                  <span className="text-3xl mt-0.5">{ride.vehicleType === "bike" ? "🏍️" : "🚗"}</span>

                  <div className="flex-1 min-w-0">
                    {/* Route + status */}
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-white">{ride.origin} → {ride.destination}</h3>
                      <StatusBadge status={ride.status === "completed" ? "completed" : booking.status} />
                    </div>
                    <p className="text-xs text-white/40 mb-2">{formatDate(ride.time)}</p>

                    {/* Driver card */}
                    <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2 w-fit">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center text-xs font-bold text-white">
                        {ride.user?.firstName?.[0]}{ride.user?.lastName?.[0]}
                      </div>
                      <div>
                        <p className="text-xs text-white font-medium">
                          {ride.user?.firstName} {ride.user?.lastName}
                        </p>
                        <p className="text-xs text-white/40">
                           {ride.user?.mobile && `${ride.user.mobile} · `}{ride.user?.vehicleModel}
                        </p>
                      </div>
                      <span className="ml-2 text-xs bg-primary-500/20 text-primary-400 border border-primary-500/30 px-2 py-0.5 rounded-full">
                        🚗 Driver
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xs text-white/30">Booked on</p>
                    <p className="text-xs text-white/60 mt-0.5">
                      {new Date(booking.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                    </p>
                    <div className="mt-2 flex items-center gap-1 text-xs text-white/40">
                      💺 {ride.availableSeats}/{ride.totalSeats} remaining
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default JoinedRides;
