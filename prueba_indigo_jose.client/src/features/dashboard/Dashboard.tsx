import { useState } from "react";
import Products from "../products/Products";
import Sales from "../sales/Sales";
import Users from "../Users/Users";
import { Navbar } from "../../shared/components/Navbar";

type TabKey = "productos" | "ventas" | "usuarios";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("productos");

  return (
    <div className="min-h-screen flex flex-col gap-6 p-6 bg-[#242424] text-slate-100 font-inter">
      <Navbar />

      <nav
        className="flex gap-3 flex-wrap"
        role="tablist"
        aria-label="Secciones"
      >
        {[
          { key: "productos", label: "Productos" },
          { key: "ventas", label: "Ventas" },
          { key: "usuarios", label: "Usuarios" },
        ].map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key as TabKey)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 border cursor-pointer
              ${
                activeTab === tab.key
                  ? "bg-linear-to-r from-indigo-600/20 to-cyan-500/10 border-indigo-600/40 text-white shadow-lg shadow-indigo-600/20"
                  : "border-white/10 text-slate-400 hover:-translate-y-0.5 hover:text-white"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="flex-1 bg-white/5 rounded-xl p-5 shadow-2xl shadow-slate-950/60 min-h-[280px] backdrop-blur-sm">
        {activeTab === "productos" && <Products />}
        {activeTab === "ventas" && <Sales />}
        {activeTab === "usuarios" && <Users />}
      </main>

      <footer className="flex justify-center text-slate-500 text-sm pt-2">
        <small>© {new Date().getFullYear()} Prueba Indigo</small>
      </footer>
    </div>
  );
};

export default Dashboard;
