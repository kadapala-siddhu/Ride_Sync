import { useEffect, useState, useCallback } from "react";
import { getMyRides, updateRide, deleteRide } from "../services/rideService";
import { getRideParticipants, acceptRequest, rejectRequest } from "../services/bookingService";
import Notification from "../components/Notification";

const formatDate = (d) =>
  new Date(d).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

const StatusBadge = ({ status }) => {
  const map = { active: "badge-active", full: "badge-full", completed: "badge-completed" };
  return <span className={map[status] || "badge-active"}>{status}</span>;
};

const MyRides = () => {
  const [rides,        setRides]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [notif,        setNotif]        = useState(null);
  const [participants, setParticipants] = useState({});   // rideId → participants[]
  const [expanded,     setExpanded]     = useState({});   // rideId → bool

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMyRides();
      setRides(res.data);
    } catch {
      setNotif({ message: "Failed to load your rides", type: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (rideId) => {
    if (!window.confirm("Delete this ride? This action cannot be undone.")) return;
    try {
      await deleteRide(rideId);
      setNotif({ message: "Ride deleted successfully", type: "success" });
      load();
    } catch (err) {
      setNotif({ message: err.response?.data?.message || "Failed to delete", type: "error" });
    }
  };

  const handleComplete = async (rideId) => {
    if (!window.confirm("Mark this ride as completed?")) return;
    try {
      await updateRide(rideId, { status: "completed" });
      setNotif({ message: "Ride marked as completed ✅", type: "success" });
      load();
    } catch (err) {
      setNotif({ message: err.response?.data?.message || "Failed to update", type: "error" });
    }
  };

  const handleAccept = async (rideId, bookingId) => {
    try {
      await acceptRequest(bookingId);
      setNotif({ message: "Passenger accepted! ✅", type: "success" });
      const res = await getRideParticipants(rideId);
      setParticipants((p) => ({ ...p, [rideId]: res.data }));
      load();
    } catch(err) {
      setNotif({ message: err.response?.data?.message || "Failed to accept", type: "error" });
    }
  };

  const handleReject = async (rideId, bookingId) => {
    try {
      await rejectRequest(bookingId);
      setNotif({ message: "Passenger rejected.", type: "success" });
      const res = await getRideParticipants(rideId);
      setParticipants((p) => ({ ...p, [rideId]: res.data }));
    } catch(err) {
      setNotif({ message: err.response?.data?.message || "Failed to reject", type: "error" });
    }
  };

  const toggleParticipants = async (rideId) => {
    // If already expanded, just collapse
    if (expanded[rideId]) {
      setExpanded((p) => ({ ...p, [rideId]: false }));
      return;
    }
    // Load participants if not cached
    if (!participants[rideId]) {
      try {
        const res = await getRideParticipants(rideId);
        setParticipants((p) => ({ ...p, [rideId]: res.data }));
      } catch {
        setNotif({ message: "Could not load participants", type: "error" });
        return;
      }
    }
    setExpanded((p) => ({ ...p, [rideId]: true }));
  };

  const stats = {
    total:     rides.length,
    active:    rides.filter((r) => r.status === "active").length,
    full:      rides.filter((r) => r.status === "full").length,
    completed: rides.filter((r) => r.status === "completed").length,
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6">
      {notif && <Notification message={notif.message} type={notif.type} onClose={() => setNotif(null)} />}

      <div className="max-w-4xl mx-auto space-y-7">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gradient">My Rides</h1>
          <p className="text-white/50 mt-1 text-sm">Manage all rides you have created</p>
        </div>

        {/* Mini stats */}
        {!loading && rides.length > 0 && (
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Total",     value: stats.total,     color: "text-white"         },
              { label: "Active",    value: stats.active,    color: "text-emerald-400"   },
              { label: "Full",      value: stats.full,      color: "text-orange-400"    },
              { label: "Completed", value: stats.completed, color: "text-blue-400"      },
            ].map(({ label, value, color }) => (
              <div key={label} className="glass-card p-4 text-center">
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-white/40 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="glass-card h-36 animate-pulse" />
            ))}
          </div>
        ) : rides.length === 0 ? (
          <div className="glass-card p-16 text-center">
            <div className="text-6xl mb-4">🚗</div>
            <h3 className="text-xl font-semibold text-white">No Rides Created</h3>
            <p className="text-white/50 mt-2 text-sm">Start offering rides to your college mates!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {rides.map((ride) => (
              <div key={ride._id} className="glass-card overflow-hidden">
                {/* Main row */}
                <div className="p-5 flex flex-col sm:flex-row items-start gap-4">
                  <span className="text-3xl mt-0.5">{ride.vehicleType === "bike" ? "🏍️" : "🚗"}</span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-white">{ride.origin} → {ride.destination}</h3>
                      <StatusBadge status={ride.status} />
                    </div>
                    <p className="text-xs text-white/40">{formatDate(ride.time)}</p>
                    <div className="flex gap-4 mt-2 text-xs text-slate-500">
                      <span>💺 {ride.availableSeats}/{ride.totalSeats} seats left</span>
                      {ride.user?.vehicleNumber && <span className="uppercase">🔢 {ride.user.vehicleNumber}</span>}
                    </div>
                  </div>

                  {/* Actions — only for non-completed rides */}
                  <div className="flex flex-wrap gap-2 shrink-0">
                    <button
                      onClick={() => toggleParticipants(ride._id)}
                      className="btn-secondary text-xs py-1.5 px-3"
                    >
                      {expanded[ride._id] ? "Hide" : `👥 Passengers (${ride.totalSeats - ride.availableSeats})`}
                    </button>
                    {ride.status !== "completed" && (
                      <>
                        <button
                          onClick={() => handleComplete(ride._id)}
                          className="btn-secondary text-xs py-1.5 px-3 text-blue-400 border-blue-500/30 hover:bg-blue-500/10"
                        >
                          ✅ Complete
                        </button>
                        <button
                          onClick={() => handleDelete(ride._id)}
                          className="btn-danger text-xs py-1.5 px-3"
                        >
                          🗑️ Delete
                        </button>
                      </>
                    )}
                    {ride.status === "completed" && (
                      <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-800 border border-dark-700 text-slate-500">
                        🔒 Locked record
                      </span>
                    )}
                  </div>
                </div>

                {/* Participants panel */}
                {expanded[ride._id] && (
                  <div className="border-t border-dark-700 p-5 bg-dark-900/50">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">
                      Passengers
                      {ride.status === "completed" && (
                        <span className="ml-2 normal-case text-slate-600">(read-only — ride completed)</span>
                      )}
                    </p>
                    {!participants[ride._id] || participants[ride._id].length === 0 ? (
                      <p className="text-slate-500 text-sm text-center py-2">No passengers on this ride</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {participants[ride._id].map((b) => (
                          <div key={b._id} className="flex items-center justify-between gap-3 bg-dark-800 border border-dark-700 rounded-lg px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-primary-800 flex items-center justify-center text-xs font-bold text-primary-300 shrink-0">
                                {b.userId?.firstName?.[0]}{b.userId?.lastName?.[0]}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm text-slate-200 font-medium truncate">
                                  {b.userId?.firstName} {b.userId?.lastName}
                                  {b.userId?.handicapped && <span className="ml-1 text-xs">♿</span>}
                                </p>
                                {/* Show accept/reject only for non-completed rides */}
                                {ride.status !== "completed" && (
                                  <span className={`text-[11px] ${
                                    b.status === "pending"  ? "text-orange-400" :
                                    b.status === "accepted" ? "text-emerald-400" : "text-red-400"
                                  }`}>
                                    {b.status}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Accept/Reject — hidden for completed rides */}
                            {b.status === "pending" && ride.status !== "completed" && (
                              <div className="flex gap-2 shrink-0">
                                <button onClick={() => handleAccept(ride._id, b._id)} className="btn-secondary text-xs py-1 px-3 text-emerald-400 hover:bg-emerald-500/20 border-emerald-800">Accept</button>
                                <button onClick={() => handleReject(ride._id, b._id)} className="btn-danger text-xs py-1 px-3">Reject</button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRides;
