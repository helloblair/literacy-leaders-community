import { Link } from "react-router-dom";

const features = [
  {
    title: "Real District Data",
    description: "Demographics from public NCES sources — enrollment, FRL, ELL, and locale type for districts across the country.",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18M3 7v14m18-14v14M6 7h12M6 11h12M6 15h12M6 19h12M9 3l3-1 3 1" />
      </svg>
    ),
    color: "brand",
  },
  {
    title: "Problem Statement Matching",
    description: "Select from 15 curated literacy challenges across 6 categories. The algorithm matches you with leaders facing the same problems.",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20" />
      </svg>
    ),
    color: "emerald",
  },
  {
    title: "Smart Matching Engine",
    description: "A composite score across five dimensions — shared problems, locale type, state, enrollment size, and FRL/ELL similarity.",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    color: "amber",
  },
  {
    title: "Direct Messaging",
    description: "Connect instantly from a match card. Threaded, one-to-one conversations so leaders can collaborate directly.",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    color: "sky",
  },
];

const colorMap = {
  brand: { bg: "bg-brand-50", border: "border-brand-200", icon: "text-brand-600", dot: "bg-brand-500" },
  emerald: { bg: "bg-emerald-50", border: "border-emerald-200", icon: "text-emerald-600", dot: "bg-emerald-500" },
  amber: { bg: "bg-amber-50", border: "border-amber-200", icon: "text-amber-600", dot: "bg-amber-500" },
  sky: { bg: "bg-sky-50", border: "border-sky-200", icon: "text-sky-600", dot: "bg-sky-500" },
};

export default function Landing() {
  return (
    <div className="flex flex-col items-center justify-center h-screen overflow-hidden px-4">
      {/* Hero */}
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-xl shadow-brand-200 mb-5">
        <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      </div>
      <h1 className="font-display font-bold text-3xl sm:text-4xl text-gray-900 mb-1.5 text-center">
        Literacy Leaders
      </h1>
      <p className="text-base sm:text-lg text-gray-400 font-medium mb-2 text-center">
        Community Platform
      </p>
      <p className="text-sm text-gray-500 max-w-2xl text-center mb-8 leading-relaxed">
        Connecting district literacy leaders based on who they are, where they are, and what challenges they're facing. Find your people — not by chance, but by match.
      </p>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl w-full mb-8">
        {features.map((f) => {
          const c = colorMap[f.color];
          return (
            <div key={f.title} className={`${c.bg} border ${c.border} rounded-2xl p-4 transition-all hover:shadow-md`}>
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-xl bg-white flex items-center justify-center ${c.icon} shadow-sm`}>
                  {f.icon}
                </div>
                <h3 className="font-display font-bold text-gray-900 text-sm">{f.title}</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{f.description}</p>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <Link
        to="/districts"
        className="px-8 py-3.5 bg-brand-600 text-white rounded-xl text-lg font-semibold hover:bg-brand-700 transition-all shadow-md shadow-brand-200 hover:shadow-lg hover:shadow-brand-300"
      >
        Explore the Community!
      </Link>
    </div>
  );
}
