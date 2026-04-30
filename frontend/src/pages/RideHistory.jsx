import { useEffect, useState, useCallback } from "react";
import { getRideHistory } from "../services/bookingService";
import { useAuth }        from "../context/AuthContext";
import Notification       from "../components/Notification";

const formatDate = (d) =>
  new Date(d).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

const StatusBadge = ({ status }) => {
  const map = { active: "badge-active", full: "badge-full", completed: "badge-completed" };
  return <span className={map[status] || "badge-active"}>{status}</span>;
};

// ─── Provider History ──────────────────────────────────────────────────────
const ProviderHistory = ({ history }) => {
  const [expanded, setExpanded] = useState({});
  const toggle = (id) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

  if (history.createdRides.length === 0) {
    return (
      <div className="glass-card p-16 text-center">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-xl font-semibold text-white">No Rides Created Yet</h3>
        <p className="text-white/50 mt-2 text-sm">Create your first ride to see history here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {history.createdRides.map(({ ride, participants }) => (
        <div key={ride._id} className="glass-card overflow-hidden">
          <div className="p-5 flex items-start gap-4">
            <span className="text-3xl mt-0.5">{ride.vehicleType === "bike" ? "🏍️" : "🚗"}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className="font-semibold text-white">{ride.origin} → {ride.destination}</h3>
                <StatusBadge status={ride.status} />
              </div>
              <p className="text-xs text-white/40">{formatDate(ride.time)}</p>
              <p className="text-xs text-slate-500 mt-1">
                💺 {ride.availableSeats}/{ride.totalSeats} seats remaining
                {ride.user?.vehicleNumber && <> · 🔢 <span className="uppercase">{ride.user.vehicleNumber}</span></>}
              </p>
            </div>
            <button
              onClick={() => toggle(ride._id)}
              className="btn-secondary text-xs py-1.5 px-3 shrink-0"
            >
              {expanded[ride._id] ? "Hide" : `👥 Passengers (${participants.length})`}
            </button>
          </div>

          {expanded[ride._id] && (
            <div className="border-t border-white/10 p-5 bg-white/2">
              {participants.length === 0 ? (
                <p className="text-white/40 text-sm text-center py-2">No passengers yet</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {participants.map((b) => (
                    <div key={b._id} className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                        {b.userId?.firstName?.[0]}{b.userId?.lastName?.[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-white font-medium truncate">
                          {b.userId?.firstName} {b.userId?.lastName}
                        </p>
                        <p className="text-xs text-white/40">{b.userId?.mobile}</p>
                      </div>
                      {b.userId?.handicapped && <span className="ml-auto text-xs">♿</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// ─── Seeker History ────────────────────────────────────────────────────────
const SeekerHistory = ({ history }) => {
  if (history.joinedRides.length === 0) {
    return (
      <div className="glass-card p-16 text-center">
        <div className="text-6xl mb-4">🎫</div>
        <h3 className="text-xl font-semibold text-white">No Ride History</h3>
        <p className="text-white/50 mt-2 text-sm">Rides you join will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {history.joinedRides.map((booking) => {
        const ride = booking.rideId;
        if (!ride) return null;
        return (
          <div key={booking._id} className="glass-card p-5 flex items-start gap-4 hover:border-accent-500/30 transition-all duration-300">
            <span className="text-3xl mt-0.5">{ride.vehicleType === "bike" ? "🏍️" : "🚗"}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className="font-semibold text-white">{ride.origin} → {ride.destination}</h3>
                <StatusBadge status={ride.status === "completed" ? "completed" : booking.status} />
              </div>
              <p className="text-xs text-white/40 mb-2">{formatDate(ride.time)}</p>
              <div className="flex items-center gap-2 bg-dark-900 border border-dark-700 rounded-lg px-3 py-2 w-fit">
                <div className="w-6 h-6 rounded-md bg-primary-800 flex items-center justify-center text-xs font-bold text-primary-300">
                  {ride.user?.firstName?.[0]}{ride.user?.lastName?.[0]}
                </div>
                <p className="text-xs text-slate-400">
                  Driver: {ride.user?.firstName} {ride.user?.lastName}
                  {ride.user?.vehicleNumber && <span className="ml-1 text-slate-500 uppercase">· {ride.user.vehicleNumber}</span>}
                  {ride.user?.mobile && <span className="ml-1 text-slate-600">· {ride.user.mobile}</span>}
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs text-white/30">Booked</p>
              <p className="text-xs text-white/60 mt-0.5">
                {new Date(booking.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── Main ──────────────────────────────────────────────────────────────────
const RideHistory = () => {
  const { user }  = useAuth();
  const [history, setHistory] = useState({ createdRides: [], joinedRides: [] });
  const [loading, setLoading] = useState(true);
  const [notif,   setNotif]   = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await getRideHistory();
      setHistory(res.data);
    } catch {
      setNotif({ message: "Failed to load ride history", type: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const count = user?.role === "provider"
    ? history.createdRides.length
    : history.joinedRides.length;

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6">
      {notif && <Notification message={notif.message} type={notif.type} onClose={() => setNotif(null)} />}

      <div className="max-w-4xl mx-auto space-y-7">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gradient">Ride History</h1>
            <p className="text-white/50 mt-1 text-sm">
              {user?.role === "provider"
                ? "All rides you have created with passenger details"
                : "All rides you have joined as a passenger"}
            </p>
          </div>
          <span className="glass-card px-4 py-2 text-sm text-white/60">
            {count} {count === 1 ? "ride" : "rides"}
          </span>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <div key={i} className="glass-card h-28 animate-pulse" />)}
          </div>
        ) : user?.role === "provider" ? (
          <ProviderHistory history={history} />
        ) : (
          <SeekerHistory history={history} />
        )}
      </div>
    </div>
  );
};

export default RideHistory;
