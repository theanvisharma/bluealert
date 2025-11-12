import React, { useState } from "react";
import { Menu } from "lucide-react";

// --- Import Pages ---
import LiveMapPage from "./pages/LiveMapPage";
import HomePage from "./pages/HomePage";
import AnalyticsPage from "./pages/AnalyticsPage";
import AlertsPage from "./pages/AlertsPage";
import SafetyPage from "./pages/SafetyPage";
import "leaflet/dist/leaflet.css";

// --- Import AiChatbot Component ---
import AiChatbot from "./components/AiChatbot.jsx";

// --- Navbar Component ---
const Navbar = ({ currentPage, setPage }) => {
  const pages = [
    { name: "Home", label: "Home" },
    { name: "LiveMap", label: "Live Map" },
    { name: "Analytics", label: "Analytics" },
    { name: "Alerts", label: "Alerts" },
    { name: "Safety", label: "Safety" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-cyan-800">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <div
          className="text-2xl font-extrabold text-cyan-400 cursor-pointer"
          onClick={() => setPage("Home")}
        >
          Blue<span className="text-white">Alert</span>
        </div>

        <nav className="hidden md:flex space-x-8 text-sm font-semibold">
          {pages.map((p) => (
            <button
              key={p.name}
              onClick={() => setPage(p.name)}
              className={`transition-colors border-b-2 pb-1 ${
                currentPage === p.name
                  ? "border-cyan-400 text-cyan-400"
                  : "border-transparent text-gray-300 hover:text-cyan-400"
              }`}
            >
              {p.label}
            </button>
          ))}
        </nav>

        <button className="md:hidden text-cyan-400">
          <Menu size={24} />
        </button>
      </div>
    </header>
  );
};

// --- Main App Router ---
export default function App() {
  const [currentPage, setCurrentPage] = useState("Home");

  const renderPage = () => {
    switch (currentPage) {
      case "Home":
        return <HomePage onPageChange={setCurrentPage} />;
      case "LiveMap":
        return <LiveMapPage />;
      case "Analytics":
        return <AnalyticsPage />;
      case "Alerts":
        return <AlertsPage />;
      case "Safety":
        return <SafetyPage />;
      default:
        return <HomePage onPageChange={setCurrentPage} />;
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-white font-sans">
      <Navbar currentPage={currentPage} setPage={setCurrentPage} />
      <main className="pt-20">{renderPage()}</main>

      {/* ✅ Floating AI Chatbot */}
      <AiChatbot />

      <footer className="py-6 text-center text-gray-500 text-xs border-t border-slate-800">
        © 2025 BlueAlert by Team QuadCoders. Built with 💙 for India.
      </footer>
    </div>
  );
}
