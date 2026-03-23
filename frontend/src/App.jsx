import { Routes, Route, NavLink, Navigate, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import DistrictExplorer from "./pages/DistrictExplorer";
import TaxonomyBrowser from "./pages/TaxonomyBrowser";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Community from "./pages/Community";
import Messages from "./pages/Messages";

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
              <span className="text-white font-display font-extrabold text-sm">LL</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-display font-bold text-gray-900">Literacy Leaders</span>
              <span className="text-xs text-gray-400 block -mt-0.5">Community Platform</span>
            </div>
          </NavLink>
          <div className="flex items-center gap-1">
            <NavLink to="/" className={linkClass} end>Districts</NavLink>
            <NavLink to="/taxonomy" className={linkClass}>Taxonomy</NavLink>
            {user ? (
              <>
                <NavLink to="/community" className={linkClass}>Community</NavLink>
                <NavLink to="/messages" className={linkClass}>Messages</NavLink>
                <NavLink to="/profile" className={linkClass}>Profile</NavLink>
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
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<DistrictExplorer />} />
          <Route path="/taxonomy" element={<TaxonomyBrowser />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        </Routes>
      </main>
      <footer className="border-t border-gray-100 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-gray-400">
          Literacy Leaders Community &mdash; Connecting districts for educational equity
        </div>
      </footer>
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
