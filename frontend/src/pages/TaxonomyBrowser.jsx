import { useState, useEffect } from "react";
import client from "../api/client";

const CATEGORY_COLORS = [
  "border-indigo-400 bg-indigo-50",
  "border-emerald-400 bg-emerald-50",
  "border-amber-400 bg-amber-50",
  "border-rose-400 bg-rose-50",
  "border-cyan-400 bg-cyan-50",
  "border-purple-400 bg-purple-50",
];

function TaxonomyBrowser() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await client.get("/taxonomy/categories/");
        setCategories(res.data.results);
      } catch (err) {
        console.error("Failed to fetch taxonomy:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-500">
        Loading taxonomy...
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Problem Statement Taxonomy
        </h1>
        <p className="mt-1 text-gray-500">
          {categories.reduce((acc, c) => acc + c.statements.length, 0)} problem
          statements across {categories.length} categories
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {categories.map((cat, i) => (
          <div
            key={cat.id}
            className={`rounded-lg border-l-4 shadow-sm bg-white overflow-hidden ${
              CATEGORY_COLORS[i % CATEGORY_COLORS.length].split(" ")[0]
            }`}
          >
            <div
              className={`px-5 py-4 ${
                CATEGORY_COLORS[i % CATEGORY_COLORS.length].split(" ")[1]
              }`}
            >
              <h2 className="font-semibold text-gray-900">{cat.name}</h2>
              {cat.description && (
                <p className="text-sm text-gray-600 mt-1">{cat.description}</p>
              )}
            </div>
            <ul className="divide-y divide-gray-100">
              {cat.statements.map((stmt) => (
                <li
                  key={stmt.id}
                  className="px-5 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-gray-300 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{stmt.title}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TaxonomyBrowser;
