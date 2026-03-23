import { Routes, Route, NavLink } from "react-router-dom";
import DistrictExplorer from "./pages/DistrictExplorer";
import TaxonomyBrowser from "./pages/TaxonomyBrowser";

function Navbar() {
  const linkClass = ({ isActive }) =>
    `px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
      isActive
        ? "bg-brand-100 text-brand-800"
        : "text-gray-500 hover:text-brand-700 hover:bg-brand-50"
    }`;

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <NavLink to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-md shadow-brand-200 group-hover:shadow-lg group-hover:shadow-brand-300 transition-shadow">
              <span className="text-white font-display font-extrabold text-sm">
                LL
              </span>
            </div>
            <div className="hidden sm:block">
              <span className="font-display font-bold text-gray-900">
                Literacy Leaders
              </span>
              <span className="text-xs text-gray-400 block -mt-0.5">
                Community Platform
              </span>
            </div>
          </NavLink>
          <div className="flex gap-1">
            <NavLink to="/" className={linkClass} end>
              Districts
            </NavLink>
            <NavLink to="/taxonomy" className={linkClass}>
              Problem Statements
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<DistrictExplorer />} />
          <Route path="/taxonomy" element={<TaxonomyBrowser />} />
        </Routes>
      </main>
      <footer className="border-t border-gray-100 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-gray-400">
          Literacy Leaders Community &mdash; Connecting districts for
          educational equity
        </div>
      </footer>
    </div>
  );
}

export default App;
