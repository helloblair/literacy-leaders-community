import { Routes, Route, NavLink, Navigate, useNavigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Landing from "./pages/Landing";
import DistrictExplorer from "./pages/DistrictExplorer";
import TaxonomyBrowser from "./pages/TaxonomyBrowser";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Community from "./pages/Community";
import Messages from "./pages/Messages";
import Moderation from "./pages/Moderation";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  return children;
}

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
      isActive
        ? "bg-brand-100 text-brand-800"
        : "text-gray-500 hover:text-brand-700 hover:bg-brand-50"
    }`;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <NavLink to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-md shadow-brand-200 group-hover:shadow-lg group-hover:shadow-brand-300 transition-shadow">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <div className="hidden sm:block">
              <span className="font-display font-bold text-gray-900">Literacy Leaders</span>
              <span className="text-xs text-gray-400 block -mt-0.5">Community Platform</span>
            </div>
          </NavLink>
          <div className="flex items-center gap-1">
            <NavLink to="/districts" className={linkClass}>Districts</NavLink>
            <NavLink to="/taxonomy" className={linkClass}>Taxonomy</NavLink>
            {user ? (
              <>
                <NavLink to="/community" className={linkClass}>Community</NavLink>
                <NavLink to="/messages" className={linkClass}>Messages</NavLink>
                <NavLink to="/profile" className={linkClass}>Profile</NavLink>
                {["moderator", "admin"].includes(user.role) && (
                  <NavLink to="/moderation" className={({ isActive }) =>
                    `px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? "bg-amber-100 text-amber-800"
                        : "text-amber-500 hover:text-amber-700 hover:bg-amber-50"
                    }`
                  }>Moderation</NavLink>
                )}
                <button onClick={handleLogout} className="px-3 py-2 rounded-lg text-sm font-semibold text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all ml-1">
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={linkClass}>Sign In</NavLink>
                <NavLink to="/register" className="ml-1 px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-semibold hover:bg-brand-700 transition-all shadow-sm shadow-brand-200">
                  Sign Up
                </NavLink>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function AppRoutes() {
  const location = useLocation();
  const isLanding = location.pathname === "/";

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {!isLanding && <Navbar />}
      <main className={isLanding ? "" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/districts" element={<DistrictExplorer />} />
          <Route path="/taxonomy" element={<TaxonomyBrowser />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
          <Route path="/community/matches" element={<ProtectedRoute><Community /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="/moderation" element={<ProtectedRoute><Moderation /></ProtectedRoute>} />
        </Routes>
      </main>
      {!isLanding && (
        <footer className="border-t border-gray-100 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-gray-400">
            Literacy Leaders Community &mdash; Connecting districts for educational equity
          </div>
        </footer>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
