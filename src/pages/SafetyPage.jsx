import React from "react";
import {
  Home,
  ClipboardCheck,
  AlertTriangle,
  Activity,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  PhoneCall,
  CloudRain,
  LifeBuoy,
} from "lucide-react";

const Safety = () => {
  const neon = {
    green: "text-green-400 drop-shadow-[0_0_8px_#00ff88]",
    blue: "text-cyan-400 drop-shadow-[0_0_8px_#00e0ff]",
    orange: "text-orange-400 drop-shadow-[0_0_8px_#ffaa00]",
  };

  // Card with customizable bullet icon type
  const Card = ({ icon: Icon, title, color, points, bullet = "check" }) => (
    <div className="p-6 bg-[#111827] rounded-2xl border border-[#1f2937] hover:border-cyan-400 hover:shadow-[0_0_15px_#00ffff] transition-all duration-300">
      <div className="flex items-center mb-3">
        <Icon className={`w-6 h-6 ${color}`} />
        <h3 className="text-lg font-semibold ml-2 text-white">{title}</h3>
      </div>
      <ul className="space-y-2 text-sm text-gray-300">
        {points.map((p, i) => (
          <li key={i} className="flex items-start">
            {bullet === "alert" ? (
              <AlertTriangle className={`w-4 h-4 mr-2 mt-0.5 ${neon.orange}`} />
            ) : (
              <CheckCircle2 className={`w-4 h-4 mr-2 mt-0.5 ${neon.green}`} />
            )}
            {p}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="bg-[#0b1120] text-white min-h-screen px-6 md:px-10 py-10">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-3 drop-shadow-[0_0_10px_#00ffff]">
          Flood Safety & Awareness
        </h1>
        <p className="text-gray-300 text-sm max-w-2xl mx-auto">
          Essential guidelines to keep you and your family safe before, during, and after floods.
          <br />
          Preparation is your best protection.
        </p>
        <div className="flex justify-center gap-4 mt-6">
          <button className="px-5 py-2 bg-pink-600 hover:bg-pink-700 rounded-full font-semibold text-sm drop-shadow-[0_0_10px_#ff00ff] transition">
            🚨 Emergency: Call 112
          </button>

          {/* Updated Download Guide Button */}
          {/* Update the download link in Safety.jsx */}
<a
  href="/Flood_Safety_Guide.zip"
  download="Flood_Safety_Guide.zip" // Suggests the new file name
  target="_blank"
  rel="noopener noreferrer"
  className="..."
>
  📘 Download Safety Guide (ZIP)
</a>
        </div>
      </div>

      {/* ===== BEFORE A FLOOD ===== */}
      <div className="text-center mb-4">
        <button className="px-4 py-1 bg-cyan-900/40 rounded-full border border-cyan-500 drop-shadow-[0_0_10px_#00ffff] text-sm">
          🌀 Before a Flood
        </button>
      </div>
      <h2 className="text-xl font-semibold text-center mb-6">Preparation Steps</h2>
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <Card
          icon={Home}
          title="Prepare Your Home"
          color={neon.blue}
          points={[
            "Move valuables to higher ground.",
            "Install sump pumps and backup power.",
            "Store emergency supplies on upper floors.",
            "Know how to shut off utilities (gas, water, electricity).",
          ]}
        />
        <Card
          icon={ClipboardCheck}
          title="Create Emergency Kit"
          color={neon.green}
          points={[
            "Pack essential supplies for 72 hours.",
            "Include first aid kit and medications.",
            "Store flashlight, extra batteries, and cash.",
            "Add emergency contact information.",
          ]}
        />
        <Card
          icon={ShieldCheck}
          title="Stay Informed"
          color={neon.blue}
          points={[
            "Monitor weather alerts regularly.",
            "Keep a battery-powered radio available.",
            "Know your evacuation routes.",
            "Register for local emergency alerts.",
          ]}
        />
      </div>

      {/* ===== DURING A FLOOD ===== */}
      <div className="text-center mb-4">
        <button className="px-4 py-1 bg-orange-900/40 rounded-full border border-orange-500 drop-shadow-[0_0_10px_#ffaa00] text-sm">
          ⚠️ During a Flood
        </button>
      </div>
      <h2 className="text-xl font-semibold text-center mb-6">Emergency Actions</h2>
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <Card
          icon={Activity}
          title="Avoid Driving"
          color={neon.orange}
          bullet="alert"
          points={[
            "6 inches of water can reach car bottom.",
            "12 inches can carry away a vehicle.",
            "18 inches can sweep away large vehicles.",
            "If trapped in a car, call for help immediately.",
          ]}
        />
        <Card
          icon={AlertTriangle}
          title="Stay Inside"
          color={neon.orange}
          bullet="alert"
          points={[
            "Move to higher floors if water enters.",
            "Avoid flooded basements.",
            "Don’t walk in moving water.",
            "Avoid wet electrical equipment.",
          ]}
        />
        <Card
          icon={PhoneCall}
          title="Emergency Communication"
          color={neon.orange}
          bullet="alert"
          points={[
            "Use text messages to save battery.",
            "Keep emergency contacts handy.",
            "Designate an out-of-area contact.",
            "Charge devices beforehand.",
          ]}
        />
      </div>

      {/* ===== AFTER A FLOOD ===== */}
      <div className="text-center mb-4">
        <button className="px-4 py-1 bg-green-900/40 rounded-full border border-green-500 drop-shadow-[0_0_10px_#00ff88] text-sm">
          💧 After a Flood
        </button>
      </div>
      <h2 className="text-xl font-semibold text-center mb-6">Recovery Process</h2>
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <Card
          icon={LifeBuoy}
          title="Health & Safety"
          color={neon.green}
          points={[
            "Avoid flood water — may contain chemicals.",
            "Wash hands frequently with soap.",
            "Get medical attention for injuries.",
            "Watch for fatigue and stress.",
          ]}
        />
        <Card
          icon={AlertCircle}
          title="Damage Assessment"
          color={neon.blue}
          points={[
            "Take photos of all damage.",
            "Avoid entering damaged buildings.",
            "Check for structural issues.",
            "Contact insurance immediately.",
          ]}
        />
        <Card
          icon={CloudRain}
          title="Cleanup & Recovery"
          color={neon.green}
          points={[
            "Pump water gradually (1/3 per day).",
            "Remove wet materials within 24–48 hours.",
            "Disinfect everything that got wet.",
            "Allow full drying before rebuilding.",
          ]}
        />
      </div>

      {/* Footer Section */}
      <div className="bg-gradient-to-r from-cyan-700 to-pink-600 p-6 rounded-2xl text-center mt-10 shadow-[0_0_25px_#00ffff]">
        <h3 className="text-2xl font-bold mb-2">Stay Prepared, Stay Safe</h3>
        <p className="text-sm text-gray-100 mb-4">
          Regular preparation and awareness are your best defense against flood disasters.
        </p>
        <div className="flex justify-center gap-4">
          {/* Footer Download Button */}
         {/* Update the download link in Safety.jsx */}
<a
  href="/Flood_Safety_Guide.zip"
  download="Flood_Safety_Guide.zip" // Suggests the new file name
  target="_blank"
  rel="noopener noreferrer"
  className="..."
>
  📘 Download Safety Guide (ZIP)
</a>

          <button className="px-5 py-2 bg-[#0b1120] rounded-full border border-white hover:bg-white hover:text-black font-semibold text-sm transition drop-shadow-[0_0_8px_#ff00ff]">
            ✅ View Safety Checklist
          </button>
        </div>
      </div>
    </div>
  );
};

export default Safety;