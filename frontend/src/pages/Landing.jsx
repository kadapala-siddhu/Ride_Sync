import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";

const ROLES = [
  {
    key:   "provider",
    emoji: "🚗",
    title: "Offer a Ride",
    badge: "Ride Provider",
    desc:  "You have a vehicle and want to share your daily commute with fellow students.",
    features: [
      "🗺️ Set your route & schedule",
      "💺 Manage passenger seats",
      "📊 Track all your rides",
      "✅ Verified driver badge",
    ],
    path:        "/register/provider",
    border:      "border-primary-700 hover:border-primary-500",
    badgeBg:     "bg-primary-900/70 text-primary-400 border-primary-800",
    btnClass:    "bg-primary-600 hover:bg-primary-500 text-white",
    accentColor: "text-primary-400",
    topBar:      "bg-primary-600",
  },
  {
    key:   "seeker",
    emoji: "🧑‍🤝‍🧑",
    title: "Find a Ride",
    badge: "Ride Seeker",
    desc:  "Looking for an affordable and safe commute to campus? Find a trusted student driver.",
    features: [
      "🔍 Browse available rides",
      "⚡ Join rides instantly",
      "🚦 Real-time seat status",
      "💛 Accessibility options",
    ],
    path:        "/register/seeker",
    border:      "border-dark-700 hover:border-accent-600",
    badgeBg:     "bg-orange-900/70 text-orange-400 border-orange-800",
    btnClass:    "bg-accent-600 hover:bg-accent-500 text-white",
    accentColor: "text-accent-400",
    topBar:      "bg-accent-600",
  },
];

const Landing = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) navigate("/dashboard", { replace: true });
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-hero-gradient flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <div className="flex flex-col items-center mb-10 animate-slide-up">
        <div className="w-14 h-14 rounded-xl bg-primary-600 flex items-center justify-center mb-4 shadow-glow">
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-white mb-1">RideSync</h1>
        <p className="text-slate-400 text-base text-center max-w-sm">
          College ride-sharing — safe, affordable, and social.
        </p>
      </div>

      {/* Role cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-2xl animate-fade-in">
        {ROLES.map((r) => (
          <div
            key={r.key}
            className={`bg-dark-800 border-2 ${r.border} rounded-xl flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-0.5`}
          >
            {/* Top accent bar */}
            <div className={`h-1 w-full ${r.topBar}`} />

            <div className="p-7 flex flex-col flex-1">
              {/* Badge */}
              <span className={`self-start inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold border ${r.badgeBg} mb-5`}>
                {r.badge}
              </span>

              {/* Icon + Title */}
              <div className="text-4xl mb-2">{r.emoji}</div>
              <h2 className="text-xl font-bold text-white mb-2">{r.title}</h2>
              <p className="text-slate-400 text-sm mb-5 leading-relaxed">{r.desc}</p>

              {/* Features */}
              <ul className="space-y-1.5 mb-7 flex-1">
                {r.features.map((f) => (
                  <li key={f} className="text-sm text-slate-300 flex items-center gap-2">
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                onClick={() => navigate(r.path)}
                className={`w-full ${r.btnClass} font-semibold py-2.5 px-6 rounded-lg transition-colors duration-200 active:scale-95`}
              >
                Get Started →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Login link */}
      <p className="text-slate-500 text-sm mt-8 animate-fade-in">
        Already have an account?{" "}
        <Link to="/login" className="text-primary-400 hover:text-primary-300 font-semibold transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default Landing;
