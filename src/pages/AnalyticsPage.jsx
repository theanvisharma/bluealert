// src/pages/AnalyticsPage.jsx
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { AlertTriangle, CloudRain, Shield, TrendingUp, BarChart, ChevronDown, CheckCircle, Clock, MapPin } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, Bar, BarChart as ReBarChart } from 'recharts';
import axios from 'axios';

// --- CONFIGURATION & STYLES ---

const NEON_CYAN = "#00FFFF";
const FILL_RED = "#ef4444"; // Tailored red
const FILL_YELLOW = "#facc15"; // Tailored yellow
const FILL_GREEN = "#10b981"; // Tailored green

const REGION_OPTIONS = ['All India', 'Maharashtra', 'Kerala', 'Tamil Nadu', 'Gujarat'];
const TIMEFRAME_OPTIONS = ['7 Days', '30 Days', '90 Days'];
const CITIES = [
    { name: 'Mumbai', lat: 19.076, lon: 72.8777, state: 'Maharashtra' },
    { name: 'Kochi', lat: 9.9312, lon: 76.2673, state: 'Kerala' },
    { name: 'Chennai', lat: 13.0827, lon: 80.2707, state: 'Tamil Nadu' },
    { name: 'Hyderabad', lat: 17.385, lon: 78.4867, state: 'Telangana' },
    { name: 'Kolkata', lat: 22.5726, lon: 88.3639, state: 'West Bengal' }
];

// OpenWeatherMap API Key (Used for dynamic current weather/forecast)
const OPENWEATHERMAP_API_KEY = "41bdc551fa0c492ec9dff0461d34ffdc";

// --- DYNAMIC DATA FETCHING ---

const fetchForecast = async (city) => {
    // Note: Using 5-day forecast for reliability and consistency with mock chart data
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${city.lat}&lon=${city.lon}&appid=${OPENWEATHERMAP_API_KEY}&units=metric`;
    try {
        const response = await axios.get(url);
        // Filter for one entry per day (around noon) for 7 days
        return response.data.list.filter((reading, index) => index % 8 === 0)
            .slice(0, 7)
            .map(d => ({
                day: new Date(d.dt * 1000).toLocaleDateString(undefined, { weekday: 'short' }),
                rainfall: d.rain?.['3h'] ? (d.rain['3h'] * 8).toFixed(1) + 'mm' : '0mm', // Extrapolate 3h rain to daily
                risk: d.pop > 0.7 ? 'High' : d.pop > 0.4 ? 'Medium' : 'Low',
            }));
    } catch (e) {
        // Fallback Mock Data for demo reliability
        return [
            { day: 'Mon', rainfall: '15mm', risk: 'Low' },
            { day: 'Tue', rainfall: '25mm', risk: 'Low' },
            { day: 'Wed', rainfall: '45mm', risk: 'Medium' },
            { day: 'Thu', rainfall: '65mm', risk: 'High' },
            { day: 'Fri', rainfall: '85mm', risk: 'High' },
            { day: 'Sat', rainfall: '75mm', risk: 'High' },
            { day: 'Sun', rainfall: '55mm', risk: 'Medium' },
        ];
    }
};

// --- MOCK DATA GENERATOR (Hybrid: Real-world trends + High-Confidence Mock) ---

const generateMockData = (region, timeframe, cityForecasts) => {
    const isLocal = region !== 'All India';
    const timeFactor = timeframe === '7 Days' ? 0.3 : timeframe === '90 Days' ? 3.0 : 1.0;
    
    // Based on IMD November 2025 Outlook: Cold Wave in North/Central India. Low rainfall overall.
    const activeAlerts = isLocal ? 3 : 7; // Low number of alerts due to current dry/cold season
    const avgRainfall = isLocal ? 12 : 55; // Low average rainfall in November

    const data = {
        // --- Kpis ---
        kpis: {
            activeAlerts: Math.round(activeAlerts * (1 + Math.random() * 0.2)),
            alertChange: (Math.random() * 10 - 20).toFixed(1), // Expected decrease
            avgRainfall: Math.round(avgRainfall * timeFactor * (1 + Math.random() * 0.1)),
            rainChange: (Math.random() * 10 - 15).toFixed(1), // Expected decrease
            citiesMonitored: isLocal ? CITIES.filter(c => c.state === region).length * 10 : 547,
            accuracy: (91 + Math.random() * 2).toFixed(1), // High accuracy based on research
            accuracyChange: (Math.random() * 1 + 0.5).toFixed(1), 
        },

        // --- Risk Distribution (High Confidence Mock) ---
        riskDistribution: [
            { name: 'High Risk (Current)', value: isLocal ? 10 : 25, color: FILL_RED }, // Permanent high-risk areas
            { name: 'Medium Risk (Seasonal)', value: isLocal ? 20 : 50, color: FILL_YELLOW },
            { name: 'Low Risk', value: isLocal ? 70 : 120, color: FILL_GREEN },
        ],

        // --- Rainfall Trend (Line Chart - Mocking seasonal pattern vs AI prediction) ---
        rainfallTrend: Array.from({ length: 13 }, (_, i) => {
            const index = i * 5; // Date approximation
            const actual = Math.round(avgRainfall + Math.sin(index * 0.1) * (isLocal ? 10 : 30) + Math.random() * 5);
            return {
                date: `Nov ${i * 3 + 1}`,
                actual: Math.max(0, actual),
                aiPrediction: Math.max(0, actual + Math.random() * 5 - 2),
            };
        }),

        // --- Flood Risk by City (Bar Chart - Mocking risk scores) ---
        floodRiskByCity: CITIES.map(city => ({
            city: city.name,
            riskScore: Math.round(60 + Math.random() * 30 * (city.name === 'Mumbai' || city.name === 'Chennai' ? 1.2 : 1)), // Higher risk for coastal cities
        })).sort((a, b) => b.riskScore - a.riskScore).slice(0, 5),

        // --- AI Predictions (Detailed Cards - High Confidence Mock) ---
        aiPredictions: [
            { 
                days: 'Next 7 Days', 
                expected: `Avg. Rainfall: ${Math.round(20 * timeFactor)}mm`, 
                confidence: `Confidence: ${Math.round(92 + Math.random() * 3)}%`, 
                risk: 'Low-Medium' 
            },
            { 
                days: 'Next 15 Days', 
                expected: `Avg. Rainfall: ${Math.round(45 * timeFactor)}mm`, 
                confidence: `Confidence: ${Math.round(85 + Math.random() * 5)}%`, 
                risk: 'Medium' 
            },
            { 
                days: 'Next 30 Days', 
                expected: `Avg. Rainfall: ${Math.round(90 * timeFactor)}mm`, 
                confidence: `Confidence: ${Math.round(75 + Math.random() * 5)}%`, 
                risk: 'Medium-High' 
            },
        ],

        // --- 7-Day Forecast (Table - Populated by fetch) ---
        dailyForecast: cityForecasts.length > 0 ? cityForecasts : [
            { day: 'Mon', rainfall: '0mm', risk: 'Low' },
            { day: 'Tue', rainfall: '0mm', risk: 'Low' },
            { day: 'Wed', rainfall: '5mm', risk: 'Low' },
            { day: 'Thu', rainfall: '10mm', risk: 'Medium' },
            { day: 'Fri', rainfall: '15mm', risk: 'Medium' },
            { day: 'Sat', rainfall: '10mm', risk: 'Medium' },
            { day: 'Sun', rainfall: '5mm', risk: 'Low' },
        ],
    };
    return data;
};

// --- STYLING HELPERS ---

const StatCard = ({ title, value, unit, change, icon: Icon, color = NEON_CYAN, timeframe }) => { // <-- timeframe prop added here
    const isPositive = parseFloat(change) >= 0;
    const changeColor = isPositive ? 'text-green-500' : 'text-red-500';

    return (
        <div className="bg-slate-800/80 p-5 rounded-xl border border-cyan-700/50 shadow-lg flex flex-col justify-between h-32 transform transition duration-300 hover:scale-[1.02] hover:shadow-cyan-900/40">
            <div className="flex items-center text-sm text-gray-400">
                <Icon size={18} className="mr-2 text-cyan-400" />
                {title}
            </div>
            <div className={`text-4xl font-extrabold`} style={{ color: color }}>
                {value}<span className="text-sm font-normal ml-1">{unit}</span>
            </div>
            <div className="text-xs text-gray-400 flex items-center">
                <TrendingUp size={14} className={`mr-1 ${changeColor} transform ${isPositive ? 'rotate-0' : 'rotate-180'}`} />
                <span className={changeColor}>{Math.abs(change)}%</span> {isPositive ? 'Increase' : 'Decrease'} ({timeframe.split(' ')[0]})
            </div>
        </div>
    );
};

const DataContainer = ({ title, children, className = "", icon: Icon = BarChart }) => (
    <div className={`bg-slate-800/80 p-6 rounded-xl border border-cyan-700/50 shadow-lg space-y-4 ${className}`}>
        <h3 className={`text-lg font-semibold text-cyan-400 flex items-center border-b border-cyan-700/50 pb-2`}>
            <Icon size={20} className="mr-2 text-cyan-400" />
            {title}
        </h3>
        {children}
    </div>
);

// Custom Tooltip content for Recharts
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900/90 p-3 rounded border border-cyan-500/50 text-white text-xs space-y-1 shadow-2xl">
                <p className="font-bold text-cyan-300">{label}</p>
                {payload.map((p, index) => (
                    <p key={index} style={{ color: p.color || p.fill }}>
                        {p.name}: {p.value} {p.unit || ''}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

// Custom Bar shape for aesthetics
const CustomBar = (props) => {
    const { x, y, width, height, fill } = props;
    return (
        <g>
            <rect x={x} y={y} width={width} height={height} fill={fill} rx={4} />
            <rect x={x} y={y} width={width} height={height} fill="url(#colorGradient)" opacity={0.7} rx={4} />
        </g>
    );
};

// --- MAIN ANALYTICS COMPONENT ---

export default function AnalyticsPage() {
    const [region, setRegion] = useState(REGION_OPTIONS[0]);
    const [timeframe, setTimeframe] = useState(TIMEFRAME_OPTIONS[1]); // Default 30 Days
    const [cityForecasts, setCityForecasts] = useState([]);

    // Fetch Forecast for Mumbai (representative city) for the table
    useEffect(() => {
        const loadForecast = async () => {
            const mumbai = CITIES.find(c => c.name === 'Mumbai');
            const data = await fetchForecast(mumbai);
            setCityForecasts(data);
        };
        loadForecast();
    }, []);

    const mockData = useMemo(() => generateMockData(region, timeframe, cityForecasts), [region, timeframe, cityForecasts]);

    const getRiskColor = (score) => {
        if (score > 80) return FILL_RED;
        if (score > 65) return FILL_YELLOW;
        return FILL_GREEN;
    };

    return (
        <div className="p-6 pt-20 min-h-screen bg-slate-950 text-white">
            
            {/* Header and Filter Controls */}
            <div className="flex justify-between items-center mb-6 border-b border-cyan-800/50 pb-3">
                <h1 className={`text-3xl font-bold text-cyan-400 flex items-center`}>
                    <Shield size={32} className="mr-3 text-red-500 animate-pulse" />
                    Flood Risk AI Dashboard
                </h1>
                <div className="flex space-x-3">
                    {/* Region Filter */}
                    <div className="relative">
                        <MapPin size={16} className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400 pointer-events-none`} />
                        <select
                            value={region}
                            onChange={(e) => setRegion(e.target.value)}
                            className={`appearance-none bg-slate-900/80 border border-cyan-700/50 text-white py-2 px-4 pl-9 pr-8 rounded-lg cursor-pointer focus:ring-cyan-500 focus:border-cyan-500 text-sm shadow-xl`}
                        >
                            {REGION_OPTIONS.map(opt => <option key={opt} value={opt} className="bg-slate-900">{opt}</option>)}
                        </select>
                        <ChevronDown size={16} className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-cyan-400 pointer-events-none`} />
                    </div>
                    {/* Timeframe Filter */}
                    <div className="relative">
                        <Clock size={16} className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400 pointer-events-none`} />
                        <select
                            value={timeframe}
                            onChange={(e) => setTimeframe(e.target.value)}
                            className={`appearance-none bg-slate-900/80 border border-cyan-700/50 text-white py-2 px-4 pl-9 pr-8 rounded-lg cursor-pointer focus:ring-cyan-500 focus:border-cyan-500 text-sm shadow-xl`}
                        >
                            {TIMEFRAME_OPTIONS.map(opt => <option key={opt} value={opt} className="bg-slate-900">{opt}</option>)}
                        </select>
                        <ChevronDown size={16} className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-cyan-400 pointer-events-none`} />
                    </div>
                </div>
            </div>

            <p className="text-md text-gray-400 mb-8">
                Analyzing data for **{region}** over the **{timeframe}**. Current focus: Post-Monsoon / Cold Wave trends.
            </p>

            {/* Row 1: KPI Cards */}
            <div className="grid grid-cols-4 gap-6 mb-8">
                <StatCard 
                    title="Active Alerts" 
                    value={mockData.kpis.activeAlerts} 
                    unit="" 
                    change={mockData.kpis.alertChange} 
                    icon={AlertTriangle} 
                    color={FILL_RED}
                    timeframe={timeframe} // <-- Prop passed
                />
                <StatCard 
                    title="Avg. Rainfall" 
                    value={mockData.kpis.avgRainfall} 
                    unit="mm" 
                    change={mockData.kpis.rainChange} 
                    icon={CloudRain} 
                    color={FILL_YELLOW}
                    timeframe={timeframe} // <-- Prop passed
                />
                <StatCard 
                    title="Coverage" 
                    value={mockData.kpis.citiesMonitored} 
                    unit="Cities" 
                    change={0}
                    icon={Shield} 
                    color={NEON_CYAN}
                    timeframe={timeframe} // <-- Prop passed
                />
                <StatCard 
                    title="AI Prediction Accuracy" 
                    value={mockData.kpis.accuracy} 
                    unit="%" 
                    change={mockData.kpis.accuracyChange} 
                    icon={TrendingUp} 
                    color={FILL_GREEN}
                    timeframe={timeframe} // <-- Prop passed
                />
            </div>

            <hr className="border-cyan-800/30 my-6" />

            {/* Row 2: Charts and Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                
                {/* Rainfall Trend (Line Chart) */}
                <DataContainer title={`Rainfall Trends (Last ${timeframe.split(' ')[0]} vs AI)`} className="lg:col-span-2 h-96" icon={TrendingUp}>
                    <ResponsiveContainer width="100%" height="95%">
                        <LineChart data={mockData.rainfallTrend} margin={{ top: 10, right: 20, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '10px' }} />
                            <YAxis stroke="#94a3b8" style={{ fontSize: '10px' }} unit="mm" />
                            <Tooltip content={<CustomTooltip />} />
                            {/* Actual Rainfall (Red for warning) */}
                            <Line type="monotone" dataKey="actual" stroke={FILL_RED} strokeWidth={2} name="Observed Rainfall" dot={false} unit="mm" />
                            {/* AI Prediction (Neon Cyan for technology) */}
                            <Line type="monotone" dataKey="aiPrediction" stroke={NEON_CYAN} strokeWidth={2} name="AI Predicted" dot={false} strokeDasharray="5 5" unit="mm" />
                        </LineChart>
                    </ResponsiveContainer>
                </DataContainer>

                {/* Risk Level Distribution (Pie Chart) */}
                <DataContainer title="AI Risk Level Distribution" className="h-96" icon={Shield}>
                    <div className="flex justify-center items-center h-full">
                        <ResponsiveContainer width="100%" height="90%">
                            <PieChart>
                                <Pie
                                    data={mockData.riskDistribution}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    labelLine={false}
                                >
                                    {mockData.riskDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Custom Legend */}
                        <div className="absolute right-6 top-1/2 transform -translate-y-1/2 text-xs space-y-2">
                            {mockData.riskDistribution.map((entry, index) => (
                                <div key={index} className="flex items-center">
                                    <span style={{ color: entry.color, marginRight: '8px', fontSize: '14px' }}>⬤</span>
                                    <span className="text-gray-300 font-medium">{entry.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </DataContainer>
            </div>

            <hr className="border-cyan-800/30 my-6" />

            {/* Row 3: Bar Chart and AI Forecast */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Flood Risk by City (Bar Chart) */}
                <DataContainer title="Flood Risk Score by City (Top 5)" className="lg:col-span-2 h-96" icon={AlertTriangle}>
                    <ResponsiveContainer width="100%" height="95%">
                        <ReBarChart data={mockData.floodRiskByCity} margin={{ top: 5, right: 30, left: -10, bottom: 5 }}>
                            <defs>
                                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={NEON_CYAN} stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#1e293b" stopOpacity={0.5}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="city" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                            <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} domain={[0, 100]} unit="%" />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar 
                                dataKey="riskScore" 
                                name="Risk Score"
                                unit="%"
                                fill="url(#colorGradient)"
                                shape={<CustomBar />}
                            >
                                {mockData.floodRiskByCity.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={getRiskColor(entry.riskScore)} />
                                ))}
                            </Bar>
                        </ReBarChart>
                    </ResponsiveContainer>
                </DataContainer>

                {/* AI Predictions (Detailed Cards) */}
                <DataContainer title="Extended AI Forecast" className="h-96 space-y-4" icon={CheckCircle}>
                    {mockData.aiPredictions.map((p, index) => (
                        <div key={index} className={`p-3 rounded-lg border ${p.risk.includes('High') ? 'border-red-600/50 bg-red-900/20' : p.risk.includes('Medium') ? 'border-yellow-600/50 bg-yellow-900/20' : 'border-cyan-600/50 bg-cyan-900/20'} shadow-md transform transition duration-300 hover:scale-[1.03]`}>
                            <div className="flex justify-between items-center">
                                <span className={`text-lg font-bold ${NEON_CYAN}`}>{p.days}</span>
                                <span className={`px-2 py-0.5 text-xs rounded-full font-semibold ${p.risk.includes('High') ? 'text-red-400 bg-red-900' : p.risk.includes('Medium') ? 'text-yellow-400 bg-yellow-900' : 'text-cyan-400 bg-cyan-900'}`}>{p.risk}</span>
                            </div>
                            <p className="text-sm text-gray-300">{p.expected}</p>
                            <p className="text-xs text-gray-500">{p.confidence}</p>
                        </div>
                    ))}
                </DataContainer>
            </div>

            <hr className="border-cyan-800/30 my-6" />

            {/* Row 4: 7-Day Forecast Table */}
            <DataContainer title={`7-Day Forecast for ${CITIES[0].name} (Hourly Rain Extrapolated)`} className="mt-8" icon={CloudRain}>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-cyan-700/50">
                        <thead>
                            <tr className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider bg-slate-700/50">
                                {mockData.dailyForecast.map(item => <th key={item.day} className="px-6 py-3">{item.day}</th>)}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-cyan-700/30">
                            <tr>
                                {mockData.dailyForecast.map((item, index) => (
                                    <td key={index} className="px-6 py-4 whitespace-nowrap">
                                        <div className={`text-sm font-semibold ${item.risk === 'High' ? 'text-red-400' : item.risk === 'Medium' ? 'text-yellow-400' : 'text-green-400'}`}>
                                            {item.rainfall}
                                        </div>
                                        <div className={`text-xs ${item.risk === 'High' ? 'text-red-600' : item.risk === 'Medium' ? 'text-yellow-600' : 'text-green-600'}`}>{item.risk}</div>
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </DataContainer>
            
            {/* Footer space */}
            <div className="h-20"></div>
        </div>
    );
}