import { useState, useEffect } from "react";
import client from "../api/client";

const STATES = ["AL", "CA", "IL", "MA", "NY", "TX"];
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

  const localeBadge = (locale) => {
    const styles = {
      urban: "bg-sky-50 text-sky-700 ring-sky-200",
      suburban: "bg-emerald-50 text-emerald-700 ring-emerald-200",
      town: "bg-amber-50 text-amber-700 ring-amber-200",
      rural: "bg-orange-50 text-orange-700 ring-orange-200",
    };
    return styles[locale] || "bg-gray-50 text-gray-700 ring-gray-200";
  };

  const totalEnrollment = districts.reduce((sum, d) => sum + d.enrollment, 0);

  return (
    <div>
      {/* Hero */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-extrabold text-gray-900 tracking-tight">
          District Explorer
        </h1>
        <p className="mt-2 text-gray-500 max-w-2xl">
          Discover and connect with school districts working on literacy
          challenges. Filter by state, locale, or search by name.
        </p>
      </div>

      {/* Stats Row */}
      {!loading && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            {
              label: "Districts",
              value: districts.length,
              color: "text-brand-700",
            },
            {
              label: "Total Enrollment",
              value: totalEnrollment.toLocaleString(),
              color: "text-gray-900",
            },
            {
              label: "States Represented",
              value: [...new Set(districts.map((d) => d.state))].length,
              color: "text-brand-700",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl border border-gray-100 px-5 py-4 shadow-sm"
            >
              <p className={`text-2xl font-display font-bold ${stat.color}`}>
                {stat.value}
              </p>
              <p className="text-xs font-medium text-gray-400 mt-1 uppercase tracking-wider">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <form onSubmit={handleSearch} className="flex-1 min-w-[220px]">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Search
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by district name..."
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-300 focus:border-brand-400 outline-none transition-all bg-gray-50 focus:bg-white"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-semibold hover:bg-brand-700 active:bg-brand-800 transition-all shadow-sm shadow-brand-200 hover:shadow-md hover:shadow-brand-200"
              >
                Search
              </button>
            </div>
          </form>

          <div className="min-w-[150px]">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              State
            </label>
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-300 focus:border-brand-400 outline-none transition-all bg-gray-50 focus:bg-white"
            >
              <option value="">All States</option>
              {STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-[150px]">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Locale
            </label>
            <select
              value={localeFilter}
              onChange={(e) => setLocaleFilter(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-300 focus:border-brand-400 outline-none transition-all bg-gray-50 focus:bg-white"
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
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        </div>
      ) : districts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg">
            No districts found matching your criteria.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {districts.map((d) => (
            <div
              key={d.id}
              className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-lg hover:border-brand-100 hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-brand-700 transition-colors">
                    {d.name}
                  </h3>
                  <p className="text-sm text-gray-400 mt-0.5">{d.state}</p>
                </div>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ring-1 ring-inset ${localeBadge(
                    d.locale_type
                  )}`}
                >
                  {d.locale_type}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-base font-bold text-gray-900">
                    {d.enrollment.toLocaleString()}
                  </p>
                  <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mt-1">
                    Enrolled
                  </p>
                </div>
                <div className="bg-brand-50 rounded-xl p-3 text-center">
                  <p className="text-base font-bold text-brand-700">
                    {d.frl_percentage}%
                  </p>
                  <p className="text-[10px] font-medium text-brand-400 uppercase tracking-wider mt-1">
                    FRL
                  </p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-3 text-center">
                  <p className="text-base font-bold text-emerald-700">
                    {d.ell_percentage}%
                  </p>
                  <p className="text-[10px] font-medium text-emerald-400 uppercase tracking-wider mt-1">
                    ELL
                  </p>
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
