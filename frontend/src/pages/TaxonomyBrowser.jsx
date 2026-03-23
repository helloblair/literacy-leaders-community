import { useState, useEffect } from "react";
import client from "../api/client";

const CATEGORY_STYLES = [
  {
    border: "border-l-brand-500",
    bg: "bg-brand-50",
    dot: "bg-brand-400",
    icon: "bg-brand-100 text-brand-700",
  },
  {
    border: "border-l-emerald-500",
    bg: "bg-emerald-50",
    dot: "bg-emerald-400",
    icon: "bg-emerald-100 text-emerald-700",
  },
  {
    border: "border-l-amber-500",
    bg: "bg-amber-50",
    dot: "bg-amber-400",
    icon: "bg-amber-100 text-amber-700",
  },
  {
    border: "border-l-rose-500",
    bg: "bg-rose-50",
    dot: "bg-rose-400",
    icon: "bg-rose-100 text-rose-700",
  },
  {
    border: "border-l-sky-500",
    bg: "bg-sky-50",
    dot: "bg-sky-400",
    icon: "bg-sky-100 text-sky-700",
  },
  {
    border: "border-l-purple-500",
    bg: "bg-purple-50",
    dot: "bg-purple-400",
    icon: "bg-purple-100 text-purple-700",
  },
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
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  const totalStatements = categories.reduce(
    (acc, c) => acc + c.statements.length,
    0
  );

  return (
    <div>
      {/* Hero */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-extrabold text-gray-900 tracking-tight">
          Problem Statement Taxonomy
        </h1>
        <p className="mt-2 text-gray-500 max-w-2xl">
          {totalStatements} literacy challenges organized across{" "}
          {categories.length} focus areas. These problem statements guide
          district matching and collaboration.
        </p>
      </div>

      {/* Summary bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6 flex items-center gap-6 flex-wrap">
        <div>
          <p className="text-2xl font-display font-bold text-brand-700">
            {totalStatements}
          </p>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mt-0.5">
            Problem Statements
          </p>
        </div>
        <div className="w-px h-10 bg-gray-100" />
        <div>
          <p className="text-2xl font-display font-bold text-gray-900">
            {categories.length}
          </p>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mt-0.5">
            Categories
          </p>
        </div>
        <div className="w-px h-10 bg-gray-100" />
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat, i) => {
            const style = CATEGORY_STYLES[i % CATEGORY_STYLES.length];
            return (
              <span
                key={cat.id}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full ${style.icon}`}
              >
                {cat.statements.length} {cat.name.split(" ")[0]}
              </span>
            );
          })}
        </div>
      </div>

      {/* Category cards */}
      <div className="grid gap-5 md:grid-cols-2">
        {categories.map((cat, i) => {
          const style = CATEGORY_STYLES[i % CATEGORY_STYLES.length];
          return (
            <div
              key={cat.id}
              className={`rounded-2xl border-l-4 ${style.border} bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow`}
            >
              <div className={`px-5 py-4 ${style.bg}`}>
                <h2 className="font-display font-bold text-gray-900">
                  {cat.name}
                </h2>
                {cat.description && (
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                    {cat.description}
                  </p>
                )}
              </div>
              <ul className="divide-y divide-gray-50">
                {cat.statements.map((stmt) => (
                  <li
                    key={stmt.id}
                    className="px-5 py-3.5 flex items-center gap-3 hover:bg-gray-50/50 transition-colors group"
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${style.dot} flex-shrink-0 group-hover:scale-125 transition-transform`}
                    />
                    <span className="text-sm text-gray-700 font-medium">
                      {stmt.title}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TaxonomyBrowser;
