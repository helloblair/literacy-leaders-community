import { Routes, Route, NavLink } from "react-router-dom";
import DistrictExplorer from "./pages/DistrictExplorer";
import TaxonomyBrowser from "./pages/TaxonomyBrowser";

function Navbar() {
  const linkClass = ({ isActive }) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? "bg-indigo-100 text-indigo-700"
        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
    }`;

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-indigo-600">LLC</span>
            <span className="text-sm text-gray-500 hidden sm:inline">
              Literacy Leaders Community
            </span>
          </div>
          <div className="flex gap-2">
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<DistrictExplorer />} />
          <Route path="/taxonomy" element={<TaxonomyBrowser />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
