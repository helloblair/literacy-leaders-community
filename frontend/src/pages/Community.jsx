import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import client from "../api/client";

const STATES = ["AL", "CA", "IL", "MA", "NY", "TX"];
const LOCALE_TYPES = ["urban", "suburban", "town", "rural"];

export default function Community() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const mode = location.pathname === "/community/matches" ? "matches" : "directory";

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stateFilter, setStateFilter] = useState("");
  const [localeFilter, setLocaleFilter] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("match_score");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, [mode, stateFilter, localeFilter, sortBy]);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    setMembers([]);
    try {
      const params = {};
      if (stateFilter) params.state = stateFilter;
      if (localeFilter) params.locale_type = localeFilter;
      if (search) params.q = search;

      const endpoint = mode === "matches" ? "/matching/find/" : "/matching/directory/";
      const res = await client.get(endpoint, { params });
      const data = res.data;

      // Client-side sort
      if (mode === "matches" && sortBy) {
        data.sort((a, b) => {
          if (sortBy === "match_score") return (b.match_score || 0) - (a.match_score || 0);
          if (sortBy === "shared") return (b.shared_problem_statements || 0) - (a.shared_problem_statements || 0);
          if (sortBy === "enrollment") return (b.user?.district_detail?.enrollment || 0) - (a.user?.district_detail?.enrollment || 0);
          return 0;
        });
      } else if (mode === "directory" && sortBy === "enrollment") {
        data.sort((a, b) => (b.district_detail?.enrollment || 0) - (a.district_detail?.enrollment || 0));
      }

      setMembers(data);
    } catch (err) {
      setMembers([]);
      if (err.response?.status === 400) {
        setError(err.response.data?.detail || "Update your profile with a district and problem statements to find matches.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData();
  };

  const startConversation = async (recipientId) => {
    navigate(`/messages?start=${recipientId}`);
  };

  const localeBadge = (locale) => {
    const styles = {
      urban: "bg-sky-50 text-sky-700", suburban: "bg-emerald-50 text-emerald-700",
      town: "bg-amber-50 text-amber-700", rural: "bg-orange-50 text-orange-700",
    };
    return styles[locale] || "bg-gray-50 text-gray-700";
  };

  const renderMember = (item, key) => {
    const member = mode === "matches" ? item.user : item;
    if (!member) return null;
    return (
      <div key={key} className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-lg hover:border-brand-100 hover:-translate-y-0.5 transition-all duration-200">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">{member.first_name} {member.last_name}</h3>
            {member.title && <p className="text-xs text-gray-400">{member.title}</p>}
          </div>
          {mode === "matches" && (
            <div className="flex flex-col items-end gap-1">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-brand-100 text-brand-700">
                {item.shared_problem_statements} shared
              </span>
              <span className="text-[10px] text-gray-400 font-medium">
                score: {item.match_score}
              </span>
            </div>
          )}
        </div>
        {member.district_detail && (
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm text-gray-600">{member.district_detail.name}</span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${localeBadge(member.district_detail.locale_type)}`}>
              {member.district_detail.locale_type}
            </span>
          </div>
        )}
        {member.problem_statements_detail?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {member.problem_statements_detail.slice(0, 4).map((ps) => (
              <span key={ps.id} className="text-[10px] px-2 py-1 rounded-full bg-gray-100 text-gray-600">{ps.title}</span>
            ))}
            {member.problem_statements_detail.length > 4 && (
              <span className="text-[10px] px-2 py-1 rounded-full bg-gray-100 text-gray-500">+{member.problem_statements_detail.length - 4} more</span>
            )}
          </div>
        )}
        <button onClick={() => startConversation(member.id)}
          className="w-full py-2 text-sm font-semibold text-brand-600 border border-brand-200 rounded-xl hover:bg-brand-50 transition-all">
          Send Message
        </button>
      </div>
    );
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-extrabold text-gray-900 tracking-tight">Community</h1>
        <p className="mt-2 text-gray-500">Connect with literacy leaders facing similar challenges</p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2 mb-6">
        <Link to="/community"
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${mode === "directory" ? "bg-brand-100 text-brand-800" : "text-gray-500 hover:bg-gray-100"}`}>
          All Members
        </Link>
        <Link to="/community/matches"
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${mode === "matches" ? "bg-brand-100 text-brand-800" : "text-gray-500 hover:bg-gray-100"}`}>
          My Matches
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <form onSubmit={handleSearch} className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Search</label>
            <div className="flex gap-2">
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or district..." className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-300 outline-none transition-all" />
              <button type="submit" className="px-5 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-semibold hover:bg-brand-700 transition-all shadow-sm shadow-brand-200">Search</button>
            </div>
          </form>
          <div className="min-w-[140px]">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">State</label>
            <select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-300 outline-none transition-all">
              <option value="">All States</option>
              {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="min-w-[140px]">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Locale</label>
            <select value={localeFilter} onChange={(e) => setLocaleFilter(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-300 outline-none transition-all">
              <option value="">All Locales</option>
              {LOCALE_TYPES.map((l) => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
            </select>
          </div>
          <div className="min-w-[160px]">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Sort By</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-300 outline-none transition-all">
              <option value="match_score">Match Score</option>
              <option value="shared">Shared Statements</option>
              <option value="enrollment">District Size</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg">{error}</p>
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg">
            {mode === "matches" ? "No matches found. Update your profile with a district and problem statements." : "No members found."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((item) => {
            const member = mode === "matches" ? item.user : item;
            if (!member) return null;
            return renderMember(item, member.id);
          })}
        </div>
      )}
    </div>
  );
}
