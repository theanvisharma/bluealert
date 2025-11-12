import React from 'react';
import { Search, MapPin, AlertTriangle, CloudRain, Thermometer } from 'lucide-react';

// Reusable component for the risk indicator dots
const RiskIndicator = ({ risk, count }) => {
    let color;
    switch (risk) {
        case 'High': color = 'bg-red-500'; break;
        case 'Medium': color = 'bg-yellow-500'; break;
        case 'Low': color = 'bg-green-500'; break;
        default: color = 'bg-gray-500';
    }
    return (
        <div className="flex justify-between items-center py-1 text-sm text-gray-300">
            <div className="flex items-center">
                <span className={`w-2 h-2 rounded-full mr-3 ${color} shadow-lg shadow-current`}></span>
                {risk} Risk
            </div>
            <span className="font-bold text-white">{count}</span>
        </div>
    );
};

// Component for a single monitored city block
const MonitoredCity = ({ city, risk, score, rainfall, status }) => {
    const riskColor = risk === 'HIGH' ? 'bg-red-700' : risk === 'MEDIUM' ? 'bg-yellow-700' : 'bg-green-700';
    
    return (
        <div className="p-3 my-2 rounded-lg bg-slate-700/50 border border-slate-600/50 cursor-pointer hover:bg-slate-700 transition">
            <div className="flex justify-between items-center">
                <span className="text-white font-semibold">{city}</span>
                <span className={`px-2 py-0.5 text-xs text-white rounded ${riskColor}`}>{risk}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Risk Score: <span className="text-white">{score}</span></span>
                <span>Rainfall: <span className="text-white">{rainfall}</span></span>
            </div>
            <p className="text-xs mt-1 text-cyan-400">{status}</p>
        </div>
    );
};


// --- Main Sidebar Component (Filters and Indicators) ---
const Sidebar = ({ setSelectedCity, cityList, detailPanelContent }) => {
    // Mock data matching the inspiration video's layout
    const THREAT_INDICATORS = [
        { risk: 'High', count: 6 },
        { risk: 'Medium', count: 15 },
        { risk: 'Low', count: 7 },
    ];
    
    const MONITORED_CITIES = [
        { city: "Mumbai", risk: "HIGH", score: "78%", rainfall: "85mm", status: "MONITORING" },
        { city: "Pune", risk: "MEDIUM", score: "45%", rainfall: "30mm", status: "NORMAL" },
        { city: "Nagpur", risk: "LOW", score: "15%", rainfall: "5mm", status: "NORMAL" },
        { city: "Nashik", risk: "HIGH", score: "62%", rainfall: "55mm", status: "ALERT" },
    ];

    return (
        <div className="flex flex-col space-y-4 h-full">
            
            {/* 1. Detail Panel (Placeholder from LiveMapPage) */}
            <div className="flex-grow">{detailPanelContent}</div>

            {/* 2. Threat Filter Section */}
            <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 space-y-3">
                <h4 className="text-sm font-semibold text-gray-300 border-b border-slate-700 pb-2">THREAT LEVEL FILTER</h4>
                <div className="flex space-x-2 text-sm">
                    <button className="px-3 py-1 bg-cyan-600 rounded text-white">ALL</button>
                    <button className="px-3 py-1 bg-slate-700 rounded text-gray-300 hover:bg-slate-600">LOW</button>
                    <button className="px-3 py-1 bg-slate-700 rounded text-gray-300 hover:bg-slate-600">MEDIUM</button>
                    <button className="px-3 py-1 bg-slate-700 rounded text-gray-300 hover:bg-slate-600">HIGH</button>
                </div>
            </div>

            {/* 3. Threat Indicators Section */}
            <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 space-y-2">
                <h4 className="text-sm font-semibold text-gray-300 border-b border-slate-700 pb-2">THREAT INDICATORS</h4>
                {THREAT_INDICATORS.map(item => (
                    <RiskIndicator key={item.risk} risk={item.risk} count={item.count} />
                ))}
            </div>

            {/* 4. Monitoring City List (Scrollable) */}
            <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 flex-grow overflow-y-auto max-h-60 custom-scrollbar">
                <h4 className="text-sm font-semibold text-gray-300 border-b border-slate-700 pb-2 mb-2">MONITORING 4 CITIES</h4>
                {MONITORED_CITIES.map(city => (
                    <MonitoredCity 
                        key={city.city} 
                        {...city} 
                        // When clicked, sets the city for the DetailPanel
                        onClick={() => setSelectedCity(cityList.find(c => c.name === city.city))}
                    />
                ))}
            </div>
        </div>
    );
};

export default Sidebar;