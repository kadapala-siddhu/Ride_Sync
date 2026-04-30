import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PROVIDER_LINKS = [
  { to: "/dashboard",    icon: "🏠", label: "Dashboard"    },
  { to: "/create-ride",  icon: "➕", label: "Create Ride"  },
  { to: "/my-rides",     icon: "🗂️",  label: "My Rides"    },
  { to: "/ride-history", icon: "📋", label: "Ride History" },
  { to: "/profile",      icon: "👤", label: "Profile"      },
];

const SEEKER_LINKS = [
  { to: "/dashboard",       icon: "🏠", label: "Dashboard"    },
  { to: "/available-rides", icon: "🔍", label: "Find Rides"   },
  { to: "/joined-rides",    icon: "🎫", label: "My Bookings"  },
  { to: "/ride-history",    icon: "📋", label: "Ride History" },
  { to: "/profile",         icon: "👤", label: "Profile"      },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logoutCtx } = useAuth();
  const navigate = useNavigate();

  const links = user?.role === "provider" ? PROVIDER_LINKS : SEEKER_LINKS;

  const handleLogout = () => {
    logoutCtx();
    navigate("/login");
  };

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-40 w-64 flex flex-col
        bg-dark-900 border-r border-dark-700
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
      `}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-dark-700">
        <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <span className="text-lg font-bold text-white">RideSync</span>

        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="ml-auto p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-dark-700 md:hidden"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-dark-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-700 flex items-center justify-center text-sm font-bold text-white shrink-0">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium mt-0.5
              ${user?.role === "provider"
                ? "bg-primary-900/60 text-primary-400 border border-primary-800"
                : "bg-orange-900/60 text-orange-400 border border-orange-800"
              }`}
            >
              {user?.role === "provider" ? "🚗 Driver" : "🧑‍🤝‍🧑 Passenger"}
            </span>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {links.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150
              ${isActive
                ? "bg-primary-600/20 text-primary-400 border-l-2 border-primary-500 pl-[10px]"
                : "text-slate-400 hover:text-slate-100 hover:bg-dark-700"
              }`
            }
          >
            <span className="text-base leading-none">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-3 border-t border-dark-700">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium
                     text-slate-400 hover:bg-red-900/30 hover:text-red-400 transition-colors duration-150"
        >
          <span className="text-base">🚪</span>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
