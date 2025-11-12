// src/pages/LiveMapPage.jsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import {
    LineChart, Line, XAxis, YAxis, Tooltip as ReTooltip, CartesianGrid, ResponsiveContainer,
} from "recharts";
import {
    Search, Thermometer, Wind, CalendarDays, MapPin, Shield, Globe, Activity, Sunrise, Sunset,
    AlertTriangle, CloudRain, Zap, Home, Clock
} from "lucide-react";

/* --------------------- CONFIG & MOCK DATA --------------------- */
// NOTE: Using fallback API key for completeness. Recommend hiding in env if live.
const OPENWEATHERMAP_API_KEY = "41bdc551fa0c492ec9dff0461d34ffdc";
const OPENWEATHERMAP_URL = "https://api.openweathermap.org/data/2.5/";

// Public GeoJSON sources (raw GitHub)
const INDIA_STATES_GEOJSON_URL = "https://raw.githubusercontent.com/geohacker/india/master/state/india_states.geojson";
const INDIA_DISTRICTS_GEOJSON_URL = "https://raw.githubusercontent.com/datameet/maps/master/GeoJSON/admin/india_districts.geojson";

// ------------------- ENHANCED RISK DATA (CITY-CENTRIC) -------------------
const HIGH_RISK_CITIES = [
    { name: "Mumbai", state: "Maharashtra", lat: 19.076, lon: 72.8777, risk: "High", riskScore: 92, population: "24.3M", floodCause: "Coastal city. High monsoon rainfall + poor drainage capacity." },
    { name: "Chennai", state: "Tamil Nadu", lat: 13.0827, lon: 80.2707, risk: "High", riskScore: 95, population: "11.5M", floodCause: "Coastal plain at river mouths. Encroached waterways & urban runoff." },
    { name: "Kolkata", state: "West Bengal", lat: 22.5726, lon: 88.3639, risk: "High", riskScore: 88, population: "15.0M", floodCause: "Deltaic region. Tidal influence + high urban population density." },
    { name: "Patna", state: "Bihar", lat: 25.5941, lon: 85.1376, risk: "High", riskScore: 85, population: "2.5M", floodCause: "Ganga River overflow. Low-lying alluvial plain with annual monsoon risk." },
    { name: "Guwahati", state: "Assam", lat: 26.1445, lon: 91.7362, risk: "High", riskScore: 85, population: "1.2M", floodCause: "Brahmaputra River overflow. Floodplain location, heavy monsoon rains." },
    { name: "Lucknow", state: "Uttar Pradesh", lat: 26.8467, lon: 80.9462, risk: "High", riskScore: 85, population: "3.5M", floodCause: "Gomti River overflow. River floodplain, inadequate drainage system." },
    { name: "Surat", state: "Gujarat", lat: 21.1702, lon: 72.8311, risk: "High", riskScore: 85, population: "6.9M", floodCause: "Tapi River floods. Coastal and riverine flooding vulnerability." },
    { name: "Srinagar", state: "Jammu and Kashmir", lat: 34.0836, lon: 74.7973, risk: "High", riskScore: 85, population: "1.3M", floodCause: "Jhelum River flooding. Riverine and flash floods in valley terrain." },
    { name: "Delhi", state: "Delhi", lat: 28.7041, lon: 77.1025, risk: "High", riskScore: 85, population: "32.0M", floodCause: "Yamuna River overflow. Urban flooding, embankment breaches." },
    { name: "Kochi", state: "Kerala", lat: 9.9312, lon: 76.2673, risk: "High", riskScore: 88, population: "2.1M", floodCause: "Coastal city. Heavy monsoon rains + poor natural drainage network." },
];

// Random/Mock Cities for Medium and Low Alerts
const MEDIUM_RISK_CITIES = [
    { name: "Pune", state: "Maharashtra", lat: 18.5204, lon: 73.8567, risk: "Medium", riskScore: 70, population: "7.4M", floodCause: "Localized urban flash floods due to intense local downpours." },
    { name: "Hyderabad", state: "Telangana", lat: 17.385, lon: 78.4867, risk: "Medium", riskScore: 65, population: "10.5M", floodCause: "Musi River overflow and urban flooding in low-lying areas." },
    { name: "Bengaluru", state: "Karnataka", lat: 12.9716, lon: 77.5946, risk: "Medium", riskScore: 75, population: "13.1M", floodCause: "Widespread urban waterlogging due to strained drainage." },
];

const LOW_RISK_CITIES = [
    { name: "Bhopal", state: "Madhya Pradesh", lat: 23.2599, lon: 77.4126, risk: "Low", riskScore: 45, population: "2.5M", floodCause: "Seasonal heavy rains and lake overflow potential." },
    { name: "Jaipur", state: "Rajasthan", lat: 26.9124, lon: 75.7873, risk: "Low", riskScore: 30, population: "4.0M", floodCause: "Desert region. Flash flooding in arid areas." },
];

// Merged list for easy iteration
const ALL_CITIES = [...HIGH_RISK_CITIES, ...MEDIUM_RISK_CITIES, ...LOW_RISK_CITIES];

// Helper to extract cities for a specific state (used for Maharashtra zoom)
const MAHARASHTRA_CITIES = ALL_CITIES.filter(c => c.state === "Maharashtra");
const HIGH_RISK_STATES = Array.from(new Set(HIGH_RISK_CITIES.map(c => c.state)));

/* --------------------- COLORS / ICONS --------------------- */
const FILL_RED = "#ef4444"; // Tailored red for better contrast
const FILL_YELLOW = "#facc15"; // Tailored yellow
const FILL_GREEN = "#10b981"; // Tailored green
const NEON_BORDER = "#00ffff"; // Bright Cyan for borders
const HIGH_ALERT_SIZE = 40; // Increased size for the warning triangle

function createWarningTriangleIcon(size = HIGH_ALERT_SIZE) {
    // Note: The triangle now uses the built-in AlertTriangle icon for better fidelity
    return L.divIcon({
        className: "warning-triangle-icon-pulse", // Custom class for CSS animation
        html: `<div style="width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;position:relative;">
                   <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="transform: scale(1.1);">
                       <path d="M12 3L2 20H22L12 3Z" fill="${FILL_RED}" stroke="#fff" stroke-width="0.8"/>
                       <path d="M12 8V12" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/>
                       <path d="M12 16H12.01" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>
                   </svg>
                   <div style="position:absolute; bottom:1px; color:#fff; font-size:${size/4}px; font-weight:bold;">!</div>
               </div>`,
        iconAnchor: [size / 2, size / 2],
        popupAnchor: [0, -size / 2],
    });
}

function createCityDotIcon(risk) {
    let color, size;
    if (risk === "High") {
        color = FILL_RED;
        size = 18; // Increased size
    } else if (risk === "Medium") {
        color = FILL_YELLOW;
        size = 16;
    } else {
        color = FILL_GREEN;
        size = 14;
    }

    return L.divIcon({
        className: "city-marker-dot",
        html: `<div style="background:${color};width:${size}px;height:${size}px;border-radius:999px;border:2px solid #0b1220; box-shadow: 0 0 5px ${color};"></div>`,
        iconAnchor: [size / 2, size / 2],
    });
}

/* --------------------- HELPERS / UTILITIES --------------------- */

// Helper to determine approximate centroid for states without explicit lat/lon
function approximateCentroid(feature) {
    try {
        const coords = L.geoJSON(feature).getBounds().getCenter();
        return [coords.lat, coords.lng];
    } catch (e) {
        return null;
    }
}

// Custom Card Component for the dashboard look
const DashboardCard = ({ children, className = "" }) => (
    <div className={`p-4 rounded-xl border border-cyan-700/30 bg-slate-900/80 backdrop-blur-sm shadow-xl shadow-cyan-900/10 ${className}`}>
        {children}
    </div>
);

// fly controller for react-leaflet
function FlyToController({ target }) {
    const map = useMap();
    useEffect(() => {
        if (!map || !target) return;
        map.flyTo(target.center, target.zoom, { duration: 1.1 });
    }, [map, target]);
    return null;
}

// Function to fetch weather and forecast data
async function fetchWeatherData(lat, lon) {
    const currentWeatherUrl = `${OPENWEATHERMAP_URL}weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHERMAP_API_KEY}&units=metric`;
    const forecastUrl = `${OPENWEATHERMAP_URL}forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHERMAP_API_KEY}&units=metric`;

    try {
        const [current, forecast] = await Promise.all([
            axios.get(currentWeatherUrl),
            axios.get(forecastUrl)
        ]);

        // Process forecast for 5 days (one entry per day)
        const dailyForecast = forecast.data.list.filter((reading, index) => index % 8 === 0)
            .slice(0, 5) // Get 5 daily entries
            .map(d => ({
                date: new Date(d.dt * 1000).toISOString().split('T')[0],
                temp: d.main.temp_max,
                icon: d.weather[0].icon,
                description: d.weather[0].description,
            }));

        return {
            current: current.data,
            forecast: dailyForecast
        };
    } catch (error) {
        console.error("Error fetching weather data:", error);
        // Fallback mock data structure
        return {
            current: {
                main: { temp: 28.0 + Math.random() * 5 },
                wind: { speed: 5.0 + Math.random() * 5 },
                weather: [{ description: "Data Unavailable - Mocking" }],
            },
            forecast: Array.from({ length: 5 }, (_, i) => ({ date: `2025-11-${12 + i}`, temp: 25 + Math.random() * 5, icon: '01d', description: 'Clear' }))
        };
    }
}

// Main map component wrapper
function MapComponent({ view, indiaGeo, mahaGeo, stateRisks, handleStateClick, onEachStateFeature, districtStyle, onEachDistrictFeature, handleCityClick, hovered, setHovered, mapTarget }) {
    const INDIA_CENTER = [22.5, 80.0];

    // Custom CSS for map markers (pulsating effect)
    useEffect(() => {
        const styleTag = document.getElementById('map-styles');
        if (!styleTag) {
            const tag = document.createElement('style');
            tag.id = 'map-styles';
            tag.innerHTML = `
                @keyframes pulse-red {
                    0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
                    70% { box-shadow: 0 0 0 14px rgba(239, 68, 68, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
                }
                .warning-triangle-icon-pulse div {
                    animation: pulse-red 1.5s infinite;
                }
                .leaflet-tooltip {
                    background-color: #0b1220 !important;
                    border: 1px solid #06b6d4 !important;
                    color: #fff !important;
                    font-weight: bold;
                    padding: 4px 8px;
                    border-radius: 4px;
                }
            `;
            document.head.appendChild(tag);
        }
    }, []);

    return (
        <div className="relative w-full h-[780px] rounded-xl overflow-hidden shadow-2xl shadow-cyan-900/50">
            <MapContainer
                center={INDIA_CENTER}
                zoom={5}
                style={{ height: "100%", width: "100%", filter: 'grayscale(0.5) brightness(0.8) contrast(1.1)' }}
                scrollWheelZoom={true}
                zoomControl={false}
                key={view}
            >
                <TileLayer
                    url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
                    attribution='&copy; Stadia Maps &copy; OpenMapTiles &copy; OpenStreetMap contributors'
                />

                {mapTarget && <FlyToController target={mapTarget} />}

                {/* India view (States) */}
                {indiaGeo && view === "India" && (
                    <GeoJSON data={indiaGeo} style={stateStyle} onEachFeature={onEachStateFeature} />
                )}

                {/* City markers (Always visible but only clickable/zoomed when appropriate) */}
                {ALL_CITIES.map((c) => {
                    const icon = c.risk === "High" ? createWarningTriangleIcon() : createCityDotIcon(c.risk);
                    
                    // Show dots on city zoom, and triangles on national view for High Risk
                    // For the sake of the request, we will show the High Alert triangle on all views if High Risk.
                    const isMahaCity = c.state === "Maharashtra";

                    // Only show cities that are NOT in the zoomed-in Maharashtra state when view is India
                    // Or show ALL cities when view is Maharashtra (for context)
                    if (view === "India" && isMahaCity) return null; // Maharashtra cities are handled by GeoJSON/Dot markers on zoom

                    return (
                        <Marker key={c.name} position={[c.lat, c.lon]} icon={icon} eventHandlers={{ click: () => handleCityClick(c) }}>
                            <Popup>
                                <div className="text-sm">
                                    <strong>{c.name}, {c.state}</strong>
                                    <div className="text-xs">Risk: {c.risk} (Score: {c.riskScore})</div>
                                    <div className="text-xs text-red-400 font-bold">Cause: {c.floodCause}</div>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}

                {/* Maharashtra view (Districts - uses GeoJSON coloring) */}
                {view === "Maharashtra" && mahaGeo && (
                    <GeoJSON data={mahaGeo} style={districtStyle} onEachFeature={onEachDistrictFeature} />
                )}

                {/* City dots overlay for Maharashtra zoom (to show exact locations/click targets) */}
                {view === "Maharashtra" && MAHARASHTRA_CITIES.map((c) => {
                    const icon = createCityDotIcon(c.risk); // Use the dot icon for location clarity on zoom
                    return (
                        <Marker key={`maha-${c.name}`} position={[c.lat, c.lon]} icon={icon} eventHandlers={{ click: () => handleCityClick(c) }}>
                            <Popup>
                                <div className="text-sm">
                                    <strong>{c.name}, {c.state}</strong>
                                    <div className="text-xs">Risk: {c.risk} (Score: {c.riskScore})</div>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}

            </MapContainer>

            {/* Top-left legend overlay */}
            <div style={{ position: "absolute", left: 16, top: 16, zIndex: 5000 }} className="bg-slate-900/80 p-3 rounded-xl border border-cyan-700/20 text-white">
                <div className="text-xs font-semibold text-cyan-300 mb-2">Rainfall Risk Legend ({view === "India" ? "States" : "Districts/Cities"})</div>
                <div className="flex gap-2 items-center text-xs">
                    <div style={{ width: 14, height: 14, background: FILL_RED, borderRadius: 999, boxShadow: `0 0 6px ${FILL_RED}` }}></div><div>High</div>
                </div>
                <div className="flex gap-2 items-center text-xs mt-1">
                    <div style={{ width: 14, height: 14, background: FILL_YELLOW, borderRadius: 999, boxShadow: `0 0 6px ${FILL_YELLOW}` }}></div><div>Medium</div>
                </div>
                <div className="flex gap-2 items-center text-xs mt-1">
                    <div style={{ width: 14, height: 14, background: FILL_GREEN, borderRadius: 999, boxShadow: `0 0 6px ${FILL_GREEN}` }}></div><div>Low</div>
                </div>
            </div>

            {/* Top-right hovered tooltip */}
            {hovered && (
                <div style={{ position: "absolute", right: 16, top: 16, zIndex: 5000 }} className="bg-slate-900/85 p-2 rounded-md border border-cyan-600/30 text-sm text-white">
                    <MapPin size={14} className="inline mr-2 text-cyan-400" />
                    <span className="font-bold text-cyan-200">{hovered}</span>
                </div>
            )}

            {/* Back to India button */}
            {view !== "India" && (
                <button
                    onClick={() => { setView("India"); setMapTarget({ center: INDIA_CENTER, zoom: 5.2 }); setSelectedCity(null); }}
                    className="absolute left-6 bottom-6 bg-slate-800/80 border border-cyan-600/40 text-white px-3 py-2 rounded-lg shadow-lg hover:bg-slate-700 z-50 transition-all duration-300"
                >
                    ← Back to India View
                </button>
            )}
        </div>
    );
}

// Right panel component with full video-style detail
function RightDetailPanel({ selectedCity, cityWeather, cityForecast, loadingCityWeather, onClose }) {
    if (!selectedCity) return null;

    const currentTemp = cityWeather?.current?.main?.temp?.toFixed(1) || '--';
    const windSpeed = cityWeather?.current?.wind?.speed?.toFixed(1) || '--';
    const weatherDesc = cityWeather?.current?.weather?.[0]?.description || 'N/A';
    const currentRainfall = selectedCity.riskScore || 0; // Using risk score as mock rainfall %
    const threatStatus = selectedCity.risk === 'High' ? 'HIGH-RISK' : selectedCity.risk.toUpperCase();
    const riverLevel = (selectedCity.riskScore / 25).toFixed(1) || 0.0; // Mock river level

    return (
        <div className="fixed right-0 top-0 h-full w-96 p-6 bg-slate-950/90 backdrop-blur-md shadow-2xl shadow-cyan-900/50 z-50 transition-transform duration-500 ease-out transform translate-x-0 border-l border-cyan-700/40">
            <div className="flex justify-between items-center border-b border-cyan-700/50 pb-3 mb-4">
                <h2 className="text-xl font-bold text-cyan-400">{selectedCity.name}</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>

            <div className="space-y-4">
                {/* Sector Info */}
                <div className="text-sm">
                    <p className="text-gray-400">{selectedCity.state} • {selectedCity.state === 'Maharashtra' ? 'West Region' : 'India'}</p>
                    <p className="text-gray-600">LAT: {selectedCity.lat.toFixed(4)} | LON: {selectedCity.lon.toFixed(4)}</p>
                </div>

                {/* Threat Status Card */}
                <DashboardCard className="!bg-slate-800/60" style={{ borderColor: selectedCity.risk === 'High' ? FILL_RED : FILL_YELLOW }}>
                    <p className="text-sm text-gray-400 mb-1">THREAT STATUS</p>
                    <div className="text-3xl font-extrabold" style={{ color: selectedCity.risk === 'High' ? FILL_RED : FILL_YELLOW }}>
                        {threatStatus}
                    </div>
                </DashboardCard>

                {/* Current Weather Metrics */}
                <div className="grid grid-cols-3 gap-3">
                    <DashboardCard>
                        <p className="text-xs text-gray-400 flex items-center mb-1"><Thermometer size={14} className="mr-1 text-cyan-400" /> TEMP</p>
                        <div className="text-xl font-bold text-white">{currentTemp}°C</div>
                    </DashboardCard>
                    <DashboardCard>
                        <p className="text-xs text-gray-400 flex items-center mb-1"><Wind size={14} className="mr-1 text-cyan-400" /> WIND</p>
                        <div className="text-xl font-bold text-white">{windSpeed} km/h</div>
                    </DashboardCard>
                    <DashboardCard>
                        <p className="text-xs text-gray-400 flex items-center mb-1"><CloudRain size={14} className="mr-1 text-cyan-400" /> RAINFALL</p>
                        <div className="text-xl font-bold text-white">{currentRainfall} mm</div>
                    </DashboardCard>
                </div>

                {/* Flood Cause & Weather Forecast */}
                <DashboardCard className="!bg-slate-800/60 border-red-700/50">
                    <h3 className="text-sm font-semibold text-red-400 border-b border-red-700/50 pb-1 mb-2">⚠️ HIGH ALERT SIMPLE REASON</h3>
                    <p className="text-xs text-white mb-3 font-medium">{selectedCity.floodCause}</p>

                    <h3 className="text-sm font-semibold text-cyan-400 border-b border-cyan-700/50 pb-1 mb-2 mt-4">7-DAY FORECAST</h3>
                    <div className="flex justify-between text-xs text-gray-400">
                        {cityForecast.map((d, i) => (
                            <div key={i} className="text-center">
                                <p className="text-cyan-300 font-bold">{d.date.substring(5).replace('-', '/')}</p>
                                <p className="text-white">{d.temp.toFixed(0)}°C</p>
                                <p className="text-gray-500">{d.description}</p>
                            </div>
                        ))}
                    </div>
                </DashboardCard>

                {/* System Status */}
                <DashboardCard className="!bg-slate-800/60">
                    <h3 className="text-sm font-semibold text-cyan-400 border-b border-cyan-700/50 pb-1 mb-2">SYSTEM STATUS</h3>
                    <div className="grid grid-cols-2 text-xs text-gray-400">
                        <div>SENSORS ONLINE: <span className="text-green-400 font-bold">24/30</span></div>
                        <div>LAST UPDATE: <span className="text-white flex items-center"><Clock size={12} className="mr-1" /> 2 MINS AGO</span></div>
                        <div className="col-span-2">POPULATION: <span className="text-white">{selectedCity.population}</span></div>
                    </div>
                </DashboardCard>

                {/* Emergency Protocol */}
                <DashboardCard className="!bg-slate-800/60 border-red-700/50">
                    <h3 className="text-sm font-semibold text-red-400 border-b border-red-700/50 pb-1 mb-2">🚨 EMERGENCY PROTOCOL</h3>
                    <p className="text-xs text-white">IMMEDIATE EVACUATION RECOMMENDED • EMERGENCY SERVICES DEPLOYED</p>
                    <div className="flex gap-3 mt-3">
                        <button className="flex-1 px-3 py-2 text-sm font-bold rounded-lg bg-red-700 hover:bg-red-600 text-white shadow-xl flex items-center justify-center">
                            <AlertTriangle size={16} className="mr-2 animate-pulse" /> DEPLOY ALERT
                        </button>
                        <button className="flex-1 px-3 py-2 text-sm font-bold rounded-lg bg-cyan-700 hover:bg-cyan-600 text-white shadow-xl">
                            SCHEDULE SCAN
                        </button>
                    </div>
                </DashboardCard>
            </div>
        </div>
    );
}

/* --------------------- MAIN COMPONENT --------------------- */
export default function LiveMapPage() {
    const [view, setView] = useState("India"); // "India" or "Maharashtra"
    const [indiaGeo, setIndiaGeo] = useState(null);
    const [mahaGeo, setMahaGeo] = useState(null); // filtered districts for Maharashtra
    const [stateRisks, setStateRisks] = useState({}); // {stateName: {risk, centroid}}
    const [mapTarget, setMapTarget] = useState(null);
    const [hovered, setHovered] = useState(null);
    const [search, setSearch] = useState("");

    const [selectedCity, setSelectedCity] = useState(null);
    const [cityWeather, setCityWeather] = useState(null);
    const [cityForecast, setCityForecast] = useState([]);
    const [loadingCityWeather, setLoadingCityWeather] = useState(false);

    const INDIA_CENTER = [22.5, 80.0];

    /* --------------------- Load GeoJSON files & Mock Risk --------------------- */
    useEffect(() => {
        // Load India States
        fetch(INDIA_STATES_GEOJSON_URL).then(r => r.json()).then(geo => {
            setIndiaGeo(geo);
            // Pre-calculate centroids for all states for risk markers
            const risks = {};
            geo.features.forEach(f => {
                const name = f.properties?.st_nm || f.properties?.STATE || f.properties?.NAME_1 || "Unknown";
                const city = HIGH_RISK_CITIES.find(c => c.state === name);
                const risk = city ? "High" : HIGH_RISK_STATES.includes(name) ? "Medium" : "Low";
                risks[name] = { risk, centroid: approximateCentroid(f) };
            });
            setStateRisks(risks);
        }).catch(e => console.error("India geojson load failed", e));

        // Load India Districts (for filtering to Maharashtra later)
        fetch(INDIA_DISTRICTS_GEOJSON_URL).then(r => r.json()).then(geo => {
            const features = (geo.features || []).filter(f => /Maharashtra/i.test(f.properties?.ST_NM || f.properties?.STATE || f.properties?.NAME_1));
            setMahaGeo({ type: "FeatureCollection", features });
        }).catch(e => console.warn("District geojson load failed, using markers.", e));

        // Auto-select Mumbai on load for a detailed view experience
        setSelectedCity(MAHARASHTRA_CITIES.find(c => c.name === "Mumbai") || null);
    }, []);

    /* --------------------- Weather Fetch Effect --------------------- */
    useEffect(() => {
        if (!selectedCity) {
            setCityWeather(null);
            setCityForecast([]);
            return;
        }

        const loadWeather = async () => {
            setLoadingCityWeather(true);
            const data = await fetchWeatherData(selectedCity.lat, selectedCity.lon);
            setCityWeather(data);
            setCityForecast(data.forecast);
            setLoadingCityWeather(false);
        };
        loadWeather();
    }, [selectedCity]);

    /* --------------------- Interaction handlers --------------------- */
    const handleStateClick = useCallback((stateName) => {
        if (/Maharashtra/i.test(stateName)) {
            setView("Maharashtra");
            setMapTarget({ center: [19.2, 75.5], zoom: 7.2 }); // Focus on Maharashtra
            setSelectedCity(MAHARASHTRA_CITIES.find(c => c.name === "Mumbai") || null); // Keep Mumbai selected
        } else {
            const s = stateRisks[stateName];
            if (s?.centroid) {
                setView("India");
                setMapTarget({ center: s.centroid, zoom: 6.6 });
            }
            setSelectedCity(ALL_CITIES.find(c => c.state === stateName && c.risk === "High") || null);
        }
    }, [stateRisks]);

    const handleCityClick = useCallback(async (city) => {
        setSelectedCity(city);
        setMapTarget({ center: [city.lat, city.lon], zoom: 10 });
    }, []);

    /* --------------------- GeoJSON style & events --------------------- */
    const stateStyle = useCallback((feature) => {
        const name = feature.properties?.st_nm || feature.properties?.STATE || feature.properties?.NAME_1 || "Unknown";
        const risk = stateRisks[name]?.risk || "Low";
        const fillColor = risk === "High" ? FILL_RED : risk === "Medium" ? FILL_YELLOW : FILL_GREEN;
        return {
            fillColor,
            color: NEON_BORDER,
            weight: risk === "High" ? 2.5 : 1.2,
            fillOpacity: 0.7,
            opacity: 1,
        };
    }, [stateRisks]);

    const onEachStateFeature = useCallback((feature, layer) => {
        const name = feature.properties?.st_nm || feature.properties?.STATE || feature.properties?.NAME_1 || "Unknown";
        const risk = stateRisks[name]?.risk || "Low";

        layer.bindTooltip(`${name} — ${risk}`, { sticky: true, direction: "auto" });
        layer.on("click", () => handleStateClick(name));
        layer.on("mouseover", () => {
            layer.setStyle({ weight: 3, fillOpacity: 0.95, color: "#00FFFF" });
            setHovered(name);
        });
        layer.on("mouseout", () => {
            layer.setStyle(stateStyle(feature));
            setHovered(null);
        });
    }, [stateRisks, handleStateClick, stateStyle]);

    const districtStyle = useCallback((feature) => {
        const dname = feature.properties?.DISTRICT || feature.properties?.NAME_2 || "Unknown";
        // Check if the district name contains a high-risk city name (e.g., 'Pune' in 'Pune District')
        const mock = MAHARASHTRA_CITIES.find((c) => new RegExp(c.name, "i").test(dname));
        const risk = mock?.risk || "Low";
        return {
            fillColor: risk === "High" ? FILL_RED : risk === "Medium" ? FILL_YELLOW : FILL_GREEN,
            color: NEON_BORDER,
            weight: 1.1,
            fillOpacity: 0.75,
            opacity: 1,
        };
    }, []);

    const onEachDistrictFeature = useCallback((feature, layer) => {
        const dname = feature.properties?.DISTRICT || feature.properties?.NAME_2 || "Unknown";
        const mock = MAHARASHTRA_CITIES.find((c) => new RegExp(c.name, "i").test(dname));
        const risk = mock?.risk || "Low";

        layer.bindTooltip(`${dname} — ${risk}`, { sticky: true });
        layer.on("click", () => {
            if (mock) handleCityClick(mock);
            else {
                const cent = approximateCentroid(feature);
                if (cent) setMapTarget({ center: cent, zoom: 10 });
            }
        });
        layer.on("mouseover", () => {
            layer.setStyle({ weight: 2.6, color: "#00FFFF", fillOpacity: 0.95 });
            setHovered(dname);
        });
        layer.on("mouseout", () => {
            layer.setStyle(districtStyle(feature));
            setHovered(null);
        });
    }, [handleCityClick, districtStyle]);

    /* --------------------- Render UI --------------------- */
    function ForecastChart({ data = [] }) {
        const formatted = data.map(d => ({ date: new Date(d.date).toLocaleDateString(undefined, { day: "2-digit", month: "short" }), temp: Number(d.temp) }));
        return (
            <div style={{ width: "100%", height: 160 }}>
                <ResponsiveContainer>
                    <LineChart data={formatted} margin={{ top: 6, right: 0, left: -10, bottom: 0 }}>
                        <CartesianGrid stroke="#0b1220" strokeDasharray="3 3" />
                        <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: 10 }} />
                        <YAxis orientation="right" stroke="#f97316" domain={['auto', 'auto']} />
                        <ReTooltip contentStyle={{ backgroundColor: "#0b1220", border: "1px solid #06b6d4" }} />
                        <Line type="monotone" dataKey="temp" stroke="#f97316" strokeWidth={2} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-4 gap-6 p-6 bg-slate-950 text-white font-sans">
            {/* Left Sidebar / Navbar */}
            <aside className="col-span-1 flex flex-col gap-6">
                <DashboardCard className="!bg-slate-800/60 !p-3">
                    <div className="flex items-center justify-between mb-3">
                        <div className="text-xl font-bold text-cyan-400">FloodAI</div>
                        <div className="text-xs text-gray-400">Dashboard</div>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-900/30 p-2 rounded border border-cyan-800/30">
                        <Search size={16} className="text-cyan-400" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search city or state..."
                            className="bg-transparent outline-none w-full text-white placeholder-gray-500 text-sm"
                        />
                    </div>

                    <div className="mt-4 text-xs text-gray-300 border-t border-slate-700 pt-3">
                        <h3 className="font-semibold text-cyan-300 mb-2">Threat Indicators (Cities)</h3>
                        <div className="flex justify-between text-red-400"><span>HIGH RISK</span><span>{HIGH_RISK_CITIES.length}</span></div>
                        <div className="flex justify-between text-yellow-400"><span>MEDIUM RISK</span><span>{MEDIUM_RISK_CITIES.length}</span></div>
                        <div className="flex justify-between text-green-400"><span>LOW RISK</span><span>{LOW_RISK_CITIES.length}</span></div>
                    </div>
                </DashboardCard>

                {/* Live data card (Cities list) */}
                <DashboardCard className="!bg-slate-800/60 border-cyan-700/50">
                    <div className="flex items-center justify-between mb-3">
                        <div className="text-sm font-semibold text-cyan-300 flex items-center"><MapPin size={16} className="mr-2"/> MONITORING CITIES</div>
                        <div className="text-xs text-gray-400">ACTIVE</div>
                    </div>

                    {ALL_CITIES
                        .filter((d) => d.name.toLowerCase().includes(search.toLowerCase()) || d.state.toLowerCase().includes(search.toLowerCase()))
                        .map((d) => (
                            <div
                                key={d.name}
                                onClick={() => handleCityClick(d)}
                                className={`p-3 mb-2 rounded flex items-center justify-between cursor-pointer border transition-all ${selectedCity?.name === d.name ? "border-cyan-500 bg-cyan-900/20" : "border-slate-700 hover:border-cyan-500/50"}`}
                            >
                                <div>
                                    <div className="font-semibold">{d.name}</div>
                                    <div className="text-xs text-gray-400">{d.state}</div>
                                </div>
                                <div className="text-right">
                                    <div className={`text-xs font-bold ${d.risk === "High" ? "text-red-400" : d.risk === "Medium" ? "text-yellow-400" : "text-green-400"}`}>{d.risk}</div>
                                    <div className="text-xs text-gray-500">Risk Score: {d.riskScore}%</div>
                                </div>
                            </div>
                        ))}
                </DashboardCard>

                {/* Small Forecast/Chart card */}
                <DashboardCard className="!bg-slate-800/60 border-cyan-700/50">
                        <h3 className="text-sm font-semibold text-cyan-300 border-b border-slate-700/50 pb-1 mb-2">Forecast Trend ({selectedCity?.name || 'Selected City'})</h3>
                        {selectedCity ? (
                                <ForecastChart data={cityForecast} />
                        ) : (
                                <div className="text-sm text-gray-500 h-[160px] flex items-center justify-center">Select a city for forecast details.</div>
                        )}
                </DashboardCard>

            </aside>

            {/* Map area (Main content) */}
            <main className="col-span-1 lg:col-span-3 relative">
                <MapComponent
                    view={view}
                    indiaGeo={indiaGeo}
                    mahaGeo={mahaGeo}
                    stateRisks={stateRisks}
                    handleStateClick={handleStateClick}
                    onEachStateFeature={onEachStateFeature}
                    districtStyle={districtStyle}
                    onEachDistrictFeature={onEachDistrictFeature}
                    handleCityClick={handleCityClick}
                    hovered={hovered}
                    setHovered={setHovered}
                    mapTarget={mapTarget}
                />
            </main>

            {/* Right Detail Panel */}
            <RightDetailPanel
                selectedCity={selectedCity}
                cityWeather={cityWeather}
                cityForecast={cityForecast}
                loadingCityWeather={loadingCityWeather}
                onClose={() => setSelectedCity(null)}
            />
        </div>
    );
}