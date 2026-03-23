import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import client from "../api/client";

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [districts, setDistricts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    client.get("/districts/?page_size=100").then((r) => setDistricts(r.data.results));
    client.get("/taxonomy/categories/").then((r) => setCategories(r.data.results));
  }, []);

  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        title: user.title || "",
        district: user.district || "",
        problem_statement_ids: user.problem_statements_detail?.map((p) => p.id) || [],
        bio: user.bio || "",
      });
    }
  }, [user]);

  if (!form) return null;

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
    setSaving(true);
    setSaved(false);
    try {
      await updateProfile({ ...form, district: form.district || null });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-300 focus:border-brand-400 outline-none transition-all";

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-extrabold text-gray-900 tracking-tight">My Profile</h1>
        <p className="mt-2 text-gray-500">Update your information and problem statement selections</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-2xl">
        {saved && <div className="bg-brand-50 text-brand-700 text-sm rounded-xl px-4 py-3 mb-4 font-medium">Profile updated!</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">First Name</label>
              <input type="text" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Last Name</label>
              <input type="text" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Title / Role</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
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
            <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Problem Statements</label>
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
          <button type="submit" disabled={saving} className="px-6 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-semibold hover:bg-brand-700 transition-all shadow-sm shadow-brand-200 disabled:opacity-50">
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}
