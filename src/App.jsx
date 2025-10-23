import React, { useState, useEffect, useCallback } from 'react';
// Imports the necessary components for the map
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { CloudRain, Thermometer, AlertTriangle, Menu, MapPin, Search } from 'lucide-react';

// The path to your GeoJSON file in the public folder
const INDIA_TOPO_JSON = "/india.json"; 

// --- Configuration Data (Mock Data) ---
const CARD_DATA = [
  { 
    title: 'Current Temperature', 
    value: '31°C', 
    unit: 'Hyderabad', 
    icon: Thermometer, 
    color: 'text-red-400', 
    bg: 'bg-red-900/30' 
  },
  { 
    title: 'Predicted Rainfall', 
    value: '45 mm/hr', 
    unit: 'Next 24 Hours', 
    icon: CloudRain, 
    color: 'text-blue-400', 
    bg: 'bg-blue-900/30' 
  },
  { 
    title: 'Flood Alert Status', 
    value: 'Critical', 
    unit: '4 Regions', 
    icon: AlertTriangle, 
    color: 'text-yellow-400', 
    bg: 'bg-yellow-900/30' 
  },
];

// --- Sub-Components ---
const Navbar = () => (
  <header className="fixed top-0 left-0 right-0 z-40 bg-slate-900/90 backdrop-blur-sm shadow-xl shadow-slate-900/50 w-full">
    <div className="container mx-auto px-4 py-4 flex justify-between items-center w-full">
      <div className="text-3xl font-extrabold text-cyan-400 tracking-wider">
        Blue<span className="text-white">Alert</span>
      </div>
      <nav className="hidden md:flex space-x-8 font-medium">
        {['Home', 'Floods', 'Hurricanes', 'Overview', 'About'].map((item) => (
          <a
            key={item}
            href={`#${item.toLowerCase()}`}
            className="text-gray-300 hover:text-cyan-400 transition-colors duration-200 uppercase text-sm tracking-wide"
          >
            {item}
          </a>
        ))}
      </nav>
      <div className="md:hidden">
        <button className="text-cyan-400 p-2 rounded-full hover:bg-slate-800 transition">
          <Menu size={24} />
        </button>
      </div>
    </div>
  </header>
);

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

// 3. Interactive Map Component (FINAL VERSION)
const IndiaMap = () => {
  const [hoveredStateName, setHoveredStateName] = useState(null);
  const [hoveredStateRisk, setHoveredStateRisk] = useState(null);

  // Function to simulate dynamic risk data for each state
  const getStateRisk = (stateName) => {
    if (stateName.includes('Maharashtra') || stateName.includes('Assam') || stateName.includes('Kerala')) return 'High';
    if (stateName.includes('Gujarat') || stateName.includes('Bihar') || stateName.includes('West Bengal')) return 'Medium';
    return 'Low';
  };

  const getFillColor = useCallback((risk) => {
    switch (risk) {
      case 'High': return '#ef4444'; // Red-500
      case 'Medium': return '#fcd34d'; // Yellow-300
      case 'Low': return '#22c55e'; // Green-500
      default: return '#334155'; // Slate-700 (Default for no risk)
    }
  }, []);

  return (
    <div className="relative p-4 flex justify-center items-center w-full min-h-[500px]">
        
        {/* Map Display Card */}
        <div className="p-2 w-full lg:w-4/5 max-w-4xl bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-slate-700 shadow-2xl shadow-cyan-900/50">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center justify-center">
                <MapPin size={20} className="mr-2 text-cyan-400" />
                India Flood Alert Map
            </h2>
            
            <div className="relative overflow-hidden w-full">
                <ComposableMap
                    projection="geoMercator" 
                    projectionConfig={{
                        scale: 1200, 
                        center: [82.8, 22.5] 
                    }}
                    style={{ width: "100%", height: "auto" }}
                >
                    <Geographies geography={INDIA_TOPO_JSON}>
                        {({ geographies }) =>
                            geographies.map(geo => {
                                // IMPORTANT: Use the correct property name from your GeoJSON file
                                const stateName = geo.properties.ST_NM || geo.properties.name || 'Unknown State';
                                const risk = getStateRisk(stateName);
                                
                                return (
                                    <Geography
                                        key={geo.rsmKey}
                                        geography={geo}
                                        onMouseEnter={() => {
                                            setHoveredStateName(stateName);
                                            setHoveredStateRisk(risk);
                                        }}
                                        onMouseLeave={() => {
                                            setHoveredStateName(null);
                                            setHoveredStateRisk(null);
                                        }}
                                        style={{
                                            default: {
                                                fill: getFillColor(risk),
                                                stroke: '#475569', 
                                                strokeWidth: 0.5,
                                                outline: 'none',
                                                transition: 'all 300ms',
                                            },
                                            hover: {
                                                fill: getFillColor(risk),
                                                stroke: '#00FFFF', 
                                                strokeWidth: 1.5,
                                                cursor: 'pointer',
                                                outline: 'none',
                                                filter: 'drop-shadow(0 0 8px rgba(0, 255, 255, 0.8))',
                                            },
                                            pressed: {
                                                outline: 'none',
                                            }
                                        }}
                                    />
                                );
                            })
                        }
                    </Geographies>
                </ComposableMap>
            </div>
            
            {/* Hovered State Tooltip/Indicator */}
            {hoveredStateName && (
                <div className="absolute top-2 left-2 bg-slate-700/80 backdrop-blur p-2 rounded-lg text-sm text-white border border-cyan-400 shadow-xl shadow-cyan-900/50">
                    <p className="font-bold text-cyan-300">Region: {hoveredStateName}</p>
                    <p className="text-xs">Risk: <span className="font-semibold" style={{color: getFillColor(hoveredStateRisk)}}>{hoveredStateRisk}</span></p>
                </div>
            )}
        </div>
        
        {/* Legend */}
        <div className="absolute top-4 right-4 z-10 bg-slate-800/80 p-3 rounded-xl shadow-lg border border-slate-700 text-xs text-gray-300 hidden md:block">
            <h4 className="font-bold text-cyan-400 mb-2">Flood Risk Legend</h4>
            <div className="space-y-1">
                <div className="flex items-center"><span className="w-3 h-3 rounded-full mr-2 bg-red-500"></span>High Alert</div>
                <div className="flex items-center"><span className="w-3 h-3 rounded-full mr-2 bg-yellow-300"></span>Medium Risk</div>
                <div className="flex items-center"><span className="w-3 h-3 rounded-full mr-2 bg-green-500"></span>Low Risk</div>
            </div>
        </div>
    </div>
  );
};

// --- Main Application Component ---
export default function App() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="w-screen h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-cyan-400 text-xl animate-pulse">Loading BlueAlert Data...</div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-900 font-sans text-white pt-20">
      <Navbar />
      
      <main className="container mx-auto px-4 md:px-8 py-8 w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2">
              Climate Alert <span className="text-cyan-400">Dashboard</span>
            </h1>
            <p className="text-gray-400 text-lg">Real-time visualization of flood risk across India.</p>
          </div>
          <div className="mt-4 md:mt-0 relative w-full md:w-80">
            <input 
              type="text" 
              placeholder="Search by City or State..."
              className="w-full py-2 pl-10 pr-4 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-150"
            />
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          </div>
        </div>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 w-full">
          {CARD_DATA.map((data, index) => (
            <AlertCard key={index} {...data} />
          ))}
        </section>

        <section className="bg-slate-900/70 border border-slate-800 rounded-3xl p-4 shadow-2xl shadow-cyan-900/30 w-full">
          <IndiaMap />
        </section>
        
      </main>

      <footer className="py-6 text-center text-gray-500 text-sm border-t border-slate-800 mt-10 w-full">
        © 2025 BlueAlert by Team QuadCoders. All Rights Reserved.
      </footer>
    </div>
  );
}