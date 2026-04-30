import { useEffect, useState, useCallback } from "react";
import { getAllRides } from "../services/rideService";
import { joinRide }   from "../services/bookingService";
import { useAuth }    from "../context/AuthContext";
import Notification   from "../components/Notification";
import { getAllUniqueStops, getPossibleDestinations } from "../utils/routesData";

const formatDate = (d) =>
  new Date(d).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

const StatusBadge = ({ status }) => {
  const cls = {
    active:    "badge-active",
    full:      "badge-full",
    completed: "badge-completed",
  }[status] || "badge-active";
  return <span className={cls}>{status}</span>;
};

const AvailableRides = () => {
  const { user } = useAuth();
  const [rides,   setRides]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [notif,   setNotif]   = useState(null);
  const [joined,  setJoined]  = useState({});        // rideId → true after joining
  const [filters, setFilters] = useState({ origin: "", destination: "" });
  const [handicapOnly, setHandicapOnly] = useState(false);
  const stops = getAllUniqueStops();

  const fetchRides = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.origin)      params.origin      = filters.origin;
      if (filters.destination) params.destination = filters.destination;
      const res = await getAllRides(params);
      setRides(res.data);
    } catch {
      setNotif({ message: "Failed to load rides", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchRides(); }, [fetchRides]);

  const handleJoin = async (rideId) => {
    try {
      await joinRide(rideId);
      setJoined((p) => ({ ...p, [rideId]: true }));
      setNotif({ message: "Ride requested successfully! ⏳", type: "success" });
      fetchRides();
    } catch (err) {
      setNotif({ message: err.response?.data?.message || "Failed to join ride", type: "error" });
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === "origin") {
      setFilters((p) => ({ ...p, origin: value, destination: "" }));
    } else {
      setFilters((p) => ({ ...p, [name]: value }));
    }
  };

  const clearFilters = () => {
    setFilters({ origin: "", destination: "" });
    setHandicapOnly(false);
  };

  // Client-side handicap filter (no backend support needed)
  const displayed = handicapOnly
    ? rides.filter((r) => r.vehicleType === "car")   // cars can accommodate
    : rides;

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6">
      {notif && <Notification message={notif.message} type={notif.type} onClose={() => setNotif(null)} />}

      <div className="max-w-5xl mx-auto space-y-7">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gradient">Find a Ride</h1>
          <p className="text-white/50 mt-1 text-sm">Browse and join rides offered by your college mates</p>
        </div>

        {/* Filters */}
        <div className="glass-card p-5 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1">
              <label className="label">From</label>
              <select name="origin" value={filters.origin} onChange={handleFilterChange} className="input-field">
                <option value="">Any Origin</option>
                {stops.map(stop => <option key={stop} value={stop}>{stop}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="label">To</label>
              <select name="destination" value={filters.destination} onChange={handleFilterChange} className="input-field">
                <option value="">Any Destination</option>
                {(filters.origin ? getPossibleDestinations(filters.origin) : stops).map(stop => <option key={stop} value={stop}>{stop}</option>)}
              </select>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={fetchRides} className="btn-primary py-3 px-6 w-auto">Search</button>
              {(filters.origin || filters.destination || handicapOnly) && (
                <button onClick={clearFilters} className="btn-secondary py-3 px-4">Clear</button>
              )}
            </div>
          </div>

          {/* Handicap filter */}
          <label className="flex items-center gap-3 cursor-pointer w-fit">
            <div
              onClick={() => setHandicapOnly((p) => !p)}
              className={`relative w-10 h-5 rounded-full transition-all duration-200 cursor-pointer
                          ${handicapOnly ? "bg-accent-500" : "bg-white/10"}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200
                                ${handicapOnly ? "translate-x-5" : ""}`} />
            </div>
            <span className="text-sm text-white/70">♿ Show car rides only (accessibility)</span>
          </label>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-card h-52 animate-pulse" />
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <div className="glass-card p-16 text-center animate-fade-in">
            <div className="text-6xl mb-4">🚌</div>
            <h3 className="text-xl font-semibold text-white">No Rides Available</h3>
            <p className="text-white/50 mt-2 text-sm">
              {filters.origin || filters.destination
                ? "No rides match your filters. Try a different route."
                : "No active rides right now. Check back soon!"}
            </p>
          </div>
        ) : (
          <>
            <p className="text-white/40 text-sm">{displayed.length} ride{displayed.length !== 1 ? "s" : ""} found</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {displayed.map((ride) => {
                const isOwner    = ride.user?._id === user?._id;
                const hasJoined  = joined[ride._id];

                return (
                  <div
                    key={ride._id}
                    className="glass-card p-5 flex flex-col gap-4 hover:border-accent-500/30 transition-all duration-300 animate-fade-in"
                  >
                    {/* Route */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-2xl">{ride.vehicleType === "bike" ? "🏍️" : "🚗"}</span>
                        <div>
                          <p className="font-semibold text-white text-sm">{ride.origin} → {ride.destination}</p>
                          <p className="text-xs text-white/50 mt-0.5">{formatDate(ride.time)}</p>
                        </div>
                      </div>
                      <StatusBadge status={ride.status} />
                    </div>

                    {/* Info grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/5 rounded-xl p-3 text-center">
                        <p className="text-xs text-white/40 mb-1">Seats Available</p>
                        <p className={`text-lg font-bold ${ride.availableSeats > 0 ? "text-accent-400" : "text-red-400"}`}>
                          {ride.availableSeats}/{ride.totalSeats}
                        </p>
                      </div>
                       <div className="bg-dark-900 rounded-lg p-3 text-center border border-dark-700">
                         <p className="text-xs text-slate-500 mb-1">Vehicle</p>
                         <p className="text-sm font-semibold text-slate-200 capitalize">
                           {ride.vehicleType}
                           {ride.user?.vehicleNumber && <span className="block text-xs text-slate-400 font-normal mt-0.5 uppercase">{ride.user.vehicleNumber}</span>}
                         </p>
                       </div>
                    </div>

                    {/* Driver info */}
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <div className="w-7 h-7 rounded-lg bg-primary-800 flex items-center justify-center text-xs font-bold text-primary-300">
                        {ride.user?.firstName?.[0]}{ride.user?.lastName?.[0]}
                      </div>
                      <span>
                        {ride.user?.firstName} {ride.user?.lastName}
                        {ride.user?.mobile && <span className="ml-1 text-slate-600">· {ride.user.mobile}</span>}
                      </span>
                      <span className="ml-auto text-xs bg-primary-900/60 text-primary-400 border border-primary-800 px-2 py-0.5 rounded">
                        🚗 Driver
                      </span>
                    </div>

                    {/* Action */}
                    <div className="pt-1">
                      {isOwner ? (
                        <span className="text-white/30 text-sm">Your ride</span>
                      ) : hasJoined ? (
                        <span className="text-emerald-400 text-sm font-medium flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Request Pending
                        </span>
                      ) : ride.status !== "active" ? (
                        <span className="text-orange-400 text-sm">
                          {ride.status === "full" ? "🔴 No seats available" : "🏁 Ride completed"}
                        </span>
                      ) : (
                        <button
                          onClick={() => handleJoin(ride._id)}
                          className="w-full bg-primary-600 hover:bg-primary-500 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors duration-200 text-sm active:scale-95"
                        >
                          Request Ride →
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AvailableRides;
