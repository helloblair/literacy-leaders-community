import { useState, useEffect } from "react";
import client from "../api/client";

const STATES = [
  "AL","CA","IL","MA","NY","TX",
];

const LOCALE_TYPES = ["urban", "suburban", "town", "rural"];

function DistrictExplorer() {
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [localeFilter, setLocaleFilter] = useState("");

  useEffect(() => {
    fetchDistricts();
  }, [stateFilter, localeFilter]);

  const fetchDistricts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (stateFilter) params.state = stateFilter;
      if (localeFilter) params.locale_type = localeFilter;
      const res = await client.get("/districts/", { params });
      setDistricts(res.data.results);
    } catch (err) {
      console.error("Failed to fetch districts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search.trim()) {
      fetchDistricts();
      return;
    }
    setLoading(true);
    try {
      const res = await client.get("/districts/search/", {
        params: { q: search },
      });
      setDistricts(res.data);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const localeBadgeColor = (locale) => {
    const colors = {
      urban: "bg-blue-100 text-blue-700",
      suburban: "bg-green-100 text-green-700",
      town: "bg-yellow-100 text-yellow-700",
      rural: "bg-orange-100 text-orange-700",
    };
    return colors[locale] || "bg-gray-100 text-gray-700";
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">District Explorer</h1>
        <p className="mt-1 text-gray-500">
          Browse and filter {districts.length} school districts across the U.S.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <form onSubmit={handleSearch} className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by district name..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                Search
              </button>
            </div>
          </form>

          <div className="min-w-[140px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State
            </label>
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            >
              <option value="">All States</option>
              {STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-[140px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Locale
            </label>
            <select
              value={localeFilter}
              onChange={(e) => setLocaleFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            >
              <option value="">All Locales</option>
              {LOCALE_TYPES.map((l) => (
                <option key={l} value={l}>
                  {l.charAt(0).toUpperCase() + l.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading districts...</div>
      ) : districts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No districts found matching your criteria.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {districts.map((d) => (
            <div
              key={d.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{d.name}</h3>
                  <p className="text-sm text-gray-500">{d.state}</p>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${localeBadgeColor(
                    d.locale_type
                  )}`}
                >
                  {d.locale_type}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-lg font-bold text-gray-900">
                    {d.enrollment.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">Enrollment</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-indigo-600">
                    {d.frl_percentage}%
                  </p>
                  <p className="text-xs text-gray-500">FRL</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-emerald-600">
                    {d.ell_percentage}%
                  </p>
                  <p className="text-xs text-gray-500">ELL</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DistrictExplorer;
