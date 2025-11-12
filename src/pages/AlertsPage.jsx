import React, { useState } from 'react';
import { Settings, AlertTriangle, MapPin, Mail, CheckCircle, Upload, Plus, Clock, Users, Check, X } from 'lucide-react';

// --- CONFIGURATION / MOCK DATA ---

const MONITOR_LOCATIONS = [
    "Select your city", 
    "Mumbai, Maharashtra", 
    "New Delhi, Delhi", 
    "Bangalore, Karnataka", 
    "Hyderabad, Telangana", 
    "Chennai, Tamil Nadu", 
    "Kolkata, West Bengal"
];

// Mock data for Recent Alerts (matches video content)
const MOCK_RECENT_ALERTS = [
    { 
        id: 1, 
        city: "Mumbai, Maharashtra", 
        risk: "High Risk", 
        time: "2 hours ago", 
        detail: "Heavy rainfall expected. Flood risk increased to 78%" 
    },
    { 
        id: 2, 
        city: "Hyderabad, Telangana", 
        risk: "Medium Risk", 
        time: "5 hours ago", 
        detail: "River levels rising. Monitor conditions closely" 
    },
    { 
        id: 3, 
        city: "Chennai, Tamil Nadu", 
        risk: "Resolved", 
        time: "1 day ago", 
        detail: "Water levels receding, Alert level reduced" 
    },
];

// Mock data for Community Reports (matches video content)
const MOCK_COMMUNITY_REPORTS = [
    {
        id: 101,
        citizen: "Citizen Report",
        area: "Andheri West, Mumbai",
        risk: "Medium",
        time: "30 minutes ago",
        status: "Verified",
        detail: "Street flooding near railway station",
        verified: true,
        service: null
    },
    {
        id: 102,
        citizen: "Emergency Services",
        area: "Kochi Port Area",
        risk: "High",
        time: "1 hour ago",
        status: "Under Review",
        detail: "Coastal flooding due to high tide",
        verified: false,
        service: true
    },
    {
        id: 103,
        citizen: "Citizen Report",
        area: "Hitech City, Hyderabad",
        risk: "Low",
        time: "3 hours ago",
        status: "Verified",
        detail: "Minor waterlogging in underpass",
        verified: true,
        service: null
    },
];

// --- STYLING HELPERS (Adapted for Dark Dashboard Theme) ---
const NEON_CYAN = "text-cyan-400";

const AlertCardStyle = ({ risk, children }) => {
    let bgColor, borderColor, textColor;
    if (risk === "High Risk") {
        bgColor = "bg-red-900/40";
        borderColor = "border-red-600/50";
        textColor = "text-red-400";
    } else if (risk === "Medium Risk") {
        bgColor = "bg-yellow-900/40";
        borderColor = "border-yellow-600/50";
        textColor = "text-yellow-400";
    } else if (risk === "Resolved") {
        bgColor = "bg-green-900/40";
        borderColor = "border-green-600/50";
        textColor = "text-green-400";
    }
    return (
        <div className={`p-4 rounded-xl border ${bgColor} ${borderColor} shadow-md`}>
            <span className={`px-2 py-0.5 text-xs font-semibold rounded ${textColor} bg-slate-900/50`}>{risk}</span>
            <div className="mt-2 text-sm text-gray-200 space-y-1">
                {children}
            </div>
        </div>
    );
};

// Main Section Container Card (Dashboard Style)
const SectionCard = ({ title, icon: Icon, children, className = "" }) => (
    <div className={`bg-slate-800/80 p-6 rounded-xl shadow-2xl border border-cyan-800/40 space-y-4 ${className}`}>
        <h2 className={`text-xl font-semibold ${NEON_CYAN} flex items-center border-b border-cyan-700/50 pb-3`}>
            <Icon size={22} className={`mr-3 ${NEON_CYAN}`} /> {title}
        </h2>
        {children}
    </div>
);

// --- MAIN COMPONENT ---

export default function AlertsPage() {
    const [emailEnabled, setEmailEnabled] = useState(true);
    const [selectedLocation, setSelectedLocation] = useState(MONITOR_LOCATIONS[0]);
    const [emailInput, setEmailInput] = useState(''); // State for email input field
    const [isSubmittingAlert, setIsSubmittingAlert] = useState(false); // State for Alert Settings submission

    const [reportForm, setReportForm] = useState({
        location: '',
        description: '',
        files: [],
        useCurrentLocation: false
    });
    
    const [isUploadingReport, setIsUploadingReport] = useState(false); // State for Report submission

    // --- BACKEND INTEGRATION LOGIC ---
    const handleAlertSettingsSubmit = async (e) => {
        e.preventDefault();

        if (selectedLocation === MONITOR_LOCATIONS[0] || !emailEnabled || !emailInput) {
            alert("Please select a city and enter a valid email to save alert settings.");
            return;
        }

        setIsSubmittingAlert(true);

        try {
            // Sending data to Flask backend at http://localhost:5000/register
            const response = await fetch("http://localhost:5000/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                // URL-encoded format matches Flask's request.form.get()
                body: new URLSearchParams({
                    city: selectedLocation, 
                    phone: "MOCK_ALERT_USER", // Placeholder phone as Flask expects it
                    email: emailInput,
                }),
            });

            const result = await response.text(); 
            alert(`SUCCESS! Alert settings saved. Server Response: ${result}`);

        } catch (error) {
            console.error("Error connecting to Flask server:", error);
            alert("CONNECTION ERROR: Failed to connect to the backend server. Is app.py running?");
        } finally {
            setIsSubmittingAlert(false);
        }
    };
    // ---------------------------------
    
    // --- REPORT FORM LOGIC (Client-Side Mock) ---
    const handleReportSubmit = (e) => {
        e.preventDefault();
        
        if (!reportForm.location && !reportForm.useCurrentLocation) {
            alert("Please enter a location or use current location for the report.");
            return;
        }

        setIsUploadingReport(true);
        console.log("Submitting Report:", reportForm);

        // Simulate network delay and submission success
        setTimeout(() => {
            alert(`Flood Report Submitted for: ${reportForm.location || 'Current Location'} (Mock Submission)`);
            setIsUploadingReport(false);
            setReportForm({ location: '', description: '', files: [], useCurrentLocation: false });
        }, 1500);
    };

    const handleFileChange = (e) => {
        setReportForm({
            ...reportForm,
            files: [...reportForm.files, ...Array.from(e.target.files)]
        });
    };
    
    // Card component for individual community report
    const CommunityReportCard = ({ report }) => {
        let riskColor;
        if (report.risk === 'High') riskColor = 'text-red-400';
        else if (report.risk === 'Medium') riskColor = 'text-yellow-400';
        else riskColor = 'text-green-400';

        return (
            <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-900/50 hover:bg-slate-900/80 transition-colors">
                <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                    <span className="font-semibold">{report.citizen}</span>
                    <span className="flex items-center"><Clock size={12} className="mr-1"/> {report.time}</span>
                </div>
                <div className="text-sm font-medium text-white">
                    {report.area}
                </div>
                <p className="text-xs text-gray-400 mt-1">{report.detail}</p>
                
                <div className="mt-2 pt-2 border-t border-slate-700 flex justify-between items-center text-xs">
                    <span className={`${riskColor} font-bold`}>
                        {report.citizen === 'Emergency Services' ? 'Emergency Services' : 'Citizen Report'}: {report.risk}
                    </span>
                    <span className="flex items-center">
                        {report.status === "Verified" ? (
                            <span className="text-green-400 font-semibold flex items-center"><Check size={14} className="mr-1"/> Verified</span>
                        ) : report.status === "Under Review" ? (
                            <span className="text-orange-400 font-semibold flex items-center"><X size={14} className="mr-1"/> Under Review</span>
                        ) : null}
                    </span>
                </div>
            </div>
        );
    };


    return (
        <div className="p-6 pt-20 min-h-screen bg-slate-950 text-white">
            <h1 className={`text-3xl font-bold ${NEON_CYAN} mb-6 border-b border-cyan-800/50 pb-3 flex items-center`}>
                <AlertTriangle size={28} className={`mr-3 text-red-400`} /> Alerts & Reports
            </h1>
            <p className="text-lg text-gray-400 mb-8">Manage notifications and report flood conditions.</p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* COLUMN 1: Alert Settings & Report Form */}
                <div className="lg:col-span-1 space-y-8">
                    
                    {/* A. Alert Settings */}
                    <SectionCard title="Alert Settings" icon={Settings}>
                        <form onSubmit={handleAlertSettingsSubmit} className="space-y-4"> {/* <-- Form tag added here */}
                            <h3 className="text-sm font-semibold text-gray-400">Monitor Location</h3>
                            <select 
                                value={selectedLocation}
                                onChange={(e) => setSelectedLocation(e.target.value)}
                                className="w-full p-2.5 rounded-lg border border-cyan-700/50 bg-slate-900/80 text-white focus:ring-cyan-500 focus:border-cyan-500"
                                disabled={isSubmittingAlert}
                            >
                                {MONITOR_LOCATIONS.map(loc => (
                                    <option key={loc} value={loc} className="bg-slate-900">{loc}</option>
                                ))}
                            </select>

                            <h3 className="text-sm font-semibold text-gray-400 pt-3 flex items-center"><Mail size={16} className="mr-2 text-cyan-400"/> Email Alerts</h3>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-400">Receive alerts via email</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={emailEnabled} onChange={() => setEmailEnabled(!emailEnabled)} className="sr-only peer" disabled={isSubmittingAlert} />
                                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                                </label>
                            </div>
                            <input 
                                type="email" 
                                placeholder="Enter your email" 
                                value={emailInput}
                                onChange={(e) => setEmailInput(e.target.value)}
                                disabled={!emailEnabled || isSubmittingAlert}
                                className={`w-full p-2.5 rounded-lg border border-cyan-700/50 ${!emailEnabled ? 'bg-slate-900/50 text-gray-500' : 'bg-slate-900/80 text-white'} focus:ring-cyan-500 focus:border-cyan-500`} 
                            />
                            
                            <button 
                                type="submit"
                                disabled={isSubmittingAlert}
                                className="w-full mt-4 py-2 bg-cyan-600 rounded-lg text-white font-bold hover:bg-cyan-700 transition-colors flex items-center justify-center shadow-lg shadow-cyan-900/50 disabled:bg-gray-600 disabled:cursor-not-allowed"
                            >
                                {isSubmittingAlert ? (
                                    <>
                                        <Clock size={18} className="mr-2 animate-spin" /> Sending Alert...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle size={18} className="mr-2" /> Save Alert Settings
                                    </>
                                )}
                            </button>
                        </form>
                    </SectionCard>
                    
                    {/* B. Report Flood Condition */}
                    <SectionCard title="Report Flood Condition" icon={MapPin}>
                        <form onSubmit={handleReportSubmit} className="space-y-4">
                            <h3 className="text-sm font-semibold text-gray-400">Location</h3>
                            <input 
                                type="text" 
                                placeholder="Enter exact location or use GPS" 
                                value={reportForm.location}
                                onChange={(e) => setReportForm({...reportForm, location: e.target.value, useCurrentLocation: false})}
                                disabled={reportForm.useCurrentLocation || isUploadingReport}
                                className="w-full p-2.5 rounded-lg border border-cyan-700/50 bg-slate-900/80 text-white focus:ring-cyan-500 focus:border-cyan-500" 
                            />
                            <div className="flex items-center space-x-2 text-sm text-cyan-400 hover:text-cyan-300 cursor-pointer" 
                                onClick={() => setReportForm({...reportForm, useCurrentLocation: !reportForm.useCurrentLocation, location: ''})}
                            >
                                <MapPin size={16} /> Use Current Location
                                {reportForm.useCurrentLocation && <CheckCircle size={16} className="text-green-500"/>}
                            </div>
                            
                            <h3 className="text-sm font-semibold text-gray-400 pt-3">Description</h3>
                            <textarea 
                                placeholder="Describe the flood condition, water level, affected areas..."
                                rows="3"
                                value={reportForm.description}
                                onChange={(e) => setReportForm({...reportForm, description: e.target.value})}
                                disabled={isUploadingReport}
                                className="w-full p-2.5 rounded-lg border border-cyan-700/50 bg-slate-900/80 text-white focus:ring-cyan-500 focus:border-cyan-500 resize-none" 
                            />

                            <h3 className="text-sm font-semibold text-gray-400 pt-3">Upload Photos (Optional)</h3>
                            <div className="border-2 border-dashed border-cyan-700/50 p-4 text-center rounded-lg bg-slate-900/50">
                                <input type="file" multiple onChange={handleFileChange} className="hidden" id="file-upload-report" disabled={isUploadingReport}/>
                                <label htmlFor="file-upload-report" className="cursor-pointer">
                                    <Upload size={32} className="mx-auto text-cyan-400"/>
                                    <p className="text-sm text-gray-400 mt-1">Click to upload photos or drag and drop</p>
                                    <span className="inline-block mt-2 px-3 py-1 text-xs bg-cyan-600/30 text-cyan-200 rounded-full">
                                        Choose Files ({reportForm.files.length})
                                    </span>
                                </label>
                            </div>

                            <button 
                                type="submit"
                                disabled={isUploadingReport}
                                className="w-full py-3 bg-green-600 rounded-lg text-white font-bold hover:bg-green-700 transition-colors flex items-center justify-center shadow-lg shadow-green-900/50 disabled:bg-gray-600 disabled:cursor-not-allowed"
                            >
                                {isUploadingReport ? (
                                    <>
                                        <Clock size={18} className="mr-2 animate-spin" /> Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Plus size={18} className="mr-2" /> Submit Report
                                    </>
                                )}
                            </button>
                        </form>
                    </SectionCard>
                </div>

                {/* COLUMN 2 & 3: Recent Alerts & Community Reports */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* C. Recent Alerts */}
                    <SectionCard title="Recent Alerts" icon={AlertTriangle}>
                        <div className="space-y-3">
                            {MOCK_RECENT_ALERTS.map(alert => (
                                <AlertCardStyle key={alert.id} risk={alert.risk}>
                                    <div className="flex justify-between items-start">
                                        <span className="text-base font-semibold text-white">{alert.city}</span>
                                        <span className="text-xs text-gray-500 flex items-center"><Clock size={12} className="mr-1"/> {alert.time}</span>
                                    </div>
                                    <p className="text-sm text-gray-300">{alert.detail}</p>
                                </AlertCardStyle>
                            ))}
                        </div>
                    </SectionCard>

                    {/* D. Community Reports */}
                    <SectionCard title="Community Reports" icon={Users}>
                        <div className="space-y-3">
                            {MOCK_COMMUNITY_REPORTS.map(report => (
                                <CommunityReportCard key={report.id} report={report} />
                            ))}
                        </div>
                    </SectionCard>
                </div>
            </div>
            
            {/* FOOTER: Reusing the footer structure for consistency */}
            <footer className="mt-12 pt-8 border-t border-cyan-800/50 bg-slate-950">
                <div className="flex justify-between text-xs text-gray-500 max-w-7xl mx-auto">
                    <p>© 2024 BlueAlert. All rights reserved.</p>
                    <div className="flex space-x-4">
                        <span className="flex items-center"><MapPin size={12} className="mr-1"/> New Delhi, India</span>
                        <span className="flex items-center"><Mail size={12} className="mr-1"/> support@floodai.gov.in</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}