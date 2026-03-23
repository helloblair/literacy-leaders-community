import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import client from "../api/client";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [districts, setDistricts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    username: "", email: "", password: "", first_name: "", last_name: "",
    title: "", district: "", problem_statement_ids: [], bio: "",
  });

  useEffect(() => {
    client.get("/districts/?page_size=100").then((r) => setDistricts(r.data.results));
    client.get("/taxonomy/categories/").then((r) => setCategories(r.data.results));
  }, []);

  const togglePS = (id) => {
    setForm((f) => ({
      ...f,
      problem_statement_ids: f.problem_statement_ids.includes(id)
        ? f.problem_statement_ids.filter((x) => x !== id)
        : [...f.problem_statement_ids, id],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = { ...form, district: form.district || null };
      await register(payload);
      navigate("/");
    } catch (err) {
      const data = err.response?.data;
      const msg = data ? Object.values(data).flat().join(" ") : "Registration failed.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-300 focus:border-brand-400 outline-none transition-all";

  return (
    <div className="flex items-center justify-center py-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-2xl">
        <div className="text-center mb-6">
          <h1 className="font-display text-2xl font-bold text-gray-900">Join the Community</h1>
          <p className="text-gray-500 text-sm mt-1">Create your Literacy Leaders account</p>
        </div>

        {error && <div className="bg-red-50 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">First Name</label>
              <input type="text" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} className={inputClass} required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Last Name</label>
              <input type="text" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} className={inputClass} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Username</label>
              <input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className={inputClass} required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Password</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputClass} required minLength={8} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Title / Role</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g., Literacy Director" className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">District</label>
            <select value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} className={inputClass}>
              <option value="">Select your district...</option>
              {districts.map((d) => <option key={d.id} value={d.id}>{d.name} ({d.state})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Bio</label>
            <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={2} placeholder="Tell the community about yourself..." className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Problem Statements</label>
            <p className="text-xs text-gray-400 mb-3">Select the literacy challenges you're working on</p>
            <div className="space-y-3">
              {categories.map((cat) => (
                <div key={cat.id}>
                  <p className="text-xs font-semibold text-gray-700 mb-1">{cat.name}</p>
                  <div className="flex flex-wrap gap-2">
                    {cat.statements.map((s) => (
                      <button key={s.id} type="button" onClick={() => togglePS(s.id)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                          form.problem_statement_ids.includes(s.id)
                            ? "bg-brand-100 border-brand-300 text-brand-800 font-semibold"
                            : "bg-gray-50 border-gray-200 text-gray-600 hover:border-brand-200"
                        }`}>
                        {s.title}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full py-2.5 bg-brand-600 text-white rounded-xl text-sm font-semibold hover:bg-brand-700 transition-all shadow-sm shadow-brand-200 disabled:opacity-50">
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          Already have an account?{" "}
          <Link to="/login" className="text-brand-600 font-semibold hover:text-brand-700">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
