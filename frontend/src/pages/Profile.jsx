import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth }     from "../context/AuthContext";
import { updateProfile, deleteAccount } from "../services/authService";
import Notification    from "../components/Notification";

const InfoRow = ({ label, value, icon }) => (
  <div className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0">
    <span className="text-xl mt-0.5">{icon}</span>
    <div>
      <p className="text-xs text-white/40 uppercase tracking-wider">{label}</p>
      <p className="text-sm text-white font-medium mt-0.5">{value ?? "—"}</p>
    </div>
  </div>
);

const Profile = () => {
  const { user, updateUser, logoutCtx } = useAuth();
  const navigate = useNavigate();
  const [notif,    setNotif]    = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [editing,  setEditing]  = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName:  user?.lastName  || "",
    email:     user?.email     || "",
    mobile:    user?.mobile    || "",
  });

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await updateProfile(form);
      updateUser(res.data);
      setNotif({ message: "Profile updated successfully ✅", type: "success" });
      setEditing(false);
    } catch (err) {
      setNotif({ message: err.response?.data?.message || "Update failed", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you absolutely sure? This will permanently delete your account and all data.")) return;
    setDeleting(true);
    try {
      await deleteAccount();
      logoutCtx();
      navigate("/");
    } catch (err) {
      setNotif({ message: err.response?.data?.message || "Delete failed", type: "error" });
      setDeleting(false);
    }
  };

  const isProvider = user?.role === "provider";

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6">
      {notif && <Notification message={notif.message} type={notif.type} onClose={() => setNotif(null)} />}

      <div className="max-w-3xl mx-auto space-y-7 animate-slide-up">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Your Profile</h1>
          <p className="text-white/50 mt-1 text-sm">View and manage your account information</p>
        </div>

        {/* Avatar hero */}
        <div className="glass-card p-8 relative overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-r ${isProvider ? "from-primary-600/10" : "from-accent-600/10"} to-transparent pointer-events-none`} />
          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
            <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${isProvider ? "from-primary-500 to-primary-700 shadow-glow" : "from-accent-500 to-accent-700 shadow-glow-pink"} flex items-center justify-center text-4xl font-bold text-white shrink-0`}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-bold text-white">{user?.firstName} {user?.lastName}</h2>
              <p className="text-white/50 text-sm mt-1">{user?.email}</p>
              <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border
                  ${isProvider
                    ? "bg-primary-500/20 text-primary-400 border-primary-500/30"
                    : "bg-accent-500/20 text-accent-400 border-accent-500/30"
                  }`}>
                  {isProvider ? "🚗 Ride Provider" : "🧑‍🤝‍🧑 Ride Seeker"}
                </span>
                {isProvider && <span className="badge-active">✅ Licensed</span>}
                {user?.handicapped && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-500/20 text-pink-400 border border-pink-500/30">
                    ♿ Accessibility
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Read-only section */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
              🔒 Account Details
            </h3>
            <p className="text-xs text-white/30 mb-4">These fields cannot be edited</p>

            <InfoRow label="Gender"   value={user?.gender}   icon="👤" />
            {isProvider && (
              <>
                <InfoRow label="Age"          value={user?.age}          icon="🎂" />
                <InfoRow label="Vehicle Type"  value={user?.vehicleType}  icon="🚘" />
                <InfoRow label="Vehicle Model" value={user?.vehicleModel} icon="🔧" />
                <InfoRow label="Seats"         value={user?.seats}        icon="💺" />
                <InfoRow label="License"       value="Valid ✅"           icon="📄" />
              </>
            )}
            {!isProvider && (
              <InfoRow label="Accessibility" value={user?.handicapped ? "Yes — enabled" : "Not required"} icon="♿" />
            )}
            <InfoRow label="Member Since" value={new Date(user?.createdAt).toLocaleDateString("en-IN", { dateStyle: "long" })} icon="📅" />
          </div>

          {/* Editable section */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">✏️ Edit Profile</h3>
              {!editing && (
                <button onClick={() => setEditing(true)} className="btn-secondary text-xs py-1.5 px-3">
                  Edit
                </button>
              )}
            </div>

            {editing ? (
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="label">First Name</label>
                  <input name="firstName" value={form.firstName} onChange={handleChange}
                    required className="input-field" />
                </div>
                <div>
                  <label className="label">Last Name</label>
                  <input name="lastName" value={form.lastName} onChange={handleChange}
                    required className="input-field" />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange}
                    required className="input-field" />
                </div>
                <div>
                  <label className="label">Mobile</label>
                  <input name="mobile" value={form.mobile} onChange={handleChange}
                    required className="input-field" />
                </div>
                <div className="flex gap-3">
                  <button type="submit" disabled={loading} className="btn-primary py-2 text-sm">
                    {loading ? "Saving…" : "Save Changes"}
                  </button>
                  <button type="button" onClick={() => setEditing(false)} className="btn-secondary text-sm py-2 px-4">
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <InfoRow label="First Name" value={user?.firstName} icon="👤" />
                <InfoRow label="Last Name"  value={user?.lastName}  icon="👤" />
                <InfoRow label="Email"      value={user?.email}     icon="📧" />
                <InfoRow label="Mobile"     value={user?.mobile}    icon="📱" />
              </div>
            )}
          </div>
        </div>

        {/* Danger zone */}
        <div className="glass-card p-6 border border-red-500/20">
          <h3 className="text-lg font-semibold text-red-400 mb-2 flex items-center gap-2">
            ⚠️ Danger Zone
          </h3>
          <p className="text-white/50 text-sm mb-4">
            Deleting your account is permanent and removes all your rides, bookings, and data.
          </p>
          {deleting ? (
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
              Deleting account…
            </div>
          ) : (
            <button onClick={handleDelete} className="btn-danger">
              🗑️ Delete My Account
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
