import React from 'react';
// Assuming the icons used in AlertCard (like AlertTriangle, CloudRain, etc.) are imported 
// where AlertCard is used. For simplicity here, we'll keep the structure clean.

const AlertCard = ({ title, value, unit, icon: Icon, color, bg }) => (
  <div className={`p-5 md:p-6 rounded-2xl border border-slate-700 ${bg} shadow-lg transition-all duration-300 hover:shadow-cyan-500/30 flex flex-col justify-between`}>
    <div className="flex items-center justify-between">
      <div className={`rounded-full p-3 ${color} bg-slate-800/50 ring-2 ring-current`}>
        <Icon size={24} />
      </div>
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">{title}</h3>
    </div>
    <div className="mt-4">
      <p className={`text-4xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-1">{unit}</p>
    </div>
  </div>
);

export default AlertCard;