import React from 'react';
import {
  Globe,
  AlertTriangle,
  TrendingUp,
  BarChart,
  Users,
  Shield,
  MapPin,
  Mail,
  Home,
  CloudRain,
  Zap,
} from 'lucide-react';

// --- CONFIGURATION FOR GOVERNMENT LINKS ---
const PARTNER_LINKS = {
  'Ministry of Earth Sciences': 'https://moes.gov.in/',
  'National Disaster Management Authority': 'https://www.ndma.gov.in/',
  'Indian Meteorological Department': 'https://mausam.imd.gov.in/',
  'Central Water Commission': 'https://cwc.gov.in/',
};

// --- Helper Components ---
const FeatureIconCard = ({ icon: Icon, title, description }) => (
  <div className="bg-slate-800/60 p-6 rounded-xl border border-slate-700 text-center space-y-3 transition-transform hover:scale-[1.02] hover:shadow-cyan-900/50 shadow-xl">
    <Icon size={40} className="mx-auto text-cyan-400 mb-2" />
    <h3 className="text-lg font-bold text-white">{title}</h3>
    <p className="text-sm text-gray-400">{description}</p>
  </div>
);

const GovernmentPartnerCard = ({ title, link }) => {
  let Icon;
  if (title.includes('Earth Sciences')) Icon = TrendingUp;
  else if (title.includes('Disaster')) Icon = Home;
  else if (title.includes('Meteorological')) Icon = CloudRain;
  else if (title.includes('Water Commission')) Icon = Zap;
  else Icon = Shield;

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 hover:border-cyan-500/50 transition-colors text-center flex flex-col items-center justify-center min-h-[100px] hover:shadow-lg hover:shadow-cyan-900/20 transform hover:scale-[1.02] duration-300"
    >
      <Icon size={32} className="text-cyan-400 mb-2" />
      <div className="text-xs text-gray-300 font-medium">{title}</div>
    </a>
  );
};

// --- NEW STATIC MAP PREVIEW ---
const MapPreviewWidget = ({ onPageChange }) => {
  const mapPoints = [
    { top: '25%', left: '48%', color: '#dc2626', alert: 'High Risk' },
    { top: '60%', left: '38%', color: '#facc15', alert: 'Medium Risk' },
    { top: '70%', left: '60%', color: '#22c55e', alert: 'Low Risk' },
  ];

  return (
    <div
      onClick={() => onPageChange('LiveMap')}
      className="relative h-72 md:h-80 bg-slate-900 rounded-xl overflow-hidden border border-cyan-600/40 shadow-lg cursor-pointer group"
    >
      {/* Background (India map silhouette simulation) */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 50%, rgba(8,145,178,0.1), rgba(8,51,68,0.95))',
        }}
      ></div>

      {/* Simulated Glow Layer */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.15)_0%,transparent_70%)]"></div>

      {/* Pulsating Alert Dots */}
      {mapPoints.map((point, index) => (
        <div
          key={index}
          className="absolute w-4 h-4 rounded-full"
          style={{
            top: point.top,
            left: point.left,
            backgroundColor: point.color,
            boxShadow: `0 0 15px ${point.color}`,
            animation: 'pulseMap 1.8s ease-in-out infinite',
          }}
          title={point.alert}
        ></div>
      ))}

      {/* Warning Triangles on High Alert */}
      {mapPoints
        .filter((p) => p.color === '#dc2626')
        .map((p, i) => (
          <AlertTriangle
            key={i}
            size={22}
            color="#f87171"
            className="absolute animate-bounce"
            style={{
              top: `calc(${p.top} - 15px)`,
              left: `calc(${p.left} - 10px)`,
            }}
          />
        ))}

      {/* Overlay Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <Globe size={48} className="text-cyan-400 mb-3" />
        <h3 className="text-xl text-white font-semibold mb-2">
          Explore the Live Flood Risk Map
        </h3>
        <p className="text-gray-300 text-sm">
          Click to see India’s real-time flood alert visualization.
        </p>
      </div>

      <style jsx>{`
        @keyframes pulseMap {
          0% {
            transform: scale(1);
            opacity: 0.9;
          }
          100% {
            transform: scale(1.8);
            opacity: 0.4;
          }
        }
      `}</style>
    </div>
  );
};

// --- MAIN HOMEPAGE ---
export default function HomePage({ onPageChange }) {
  const statCardClass =
    'bg-slate-900/80 p-4 rounded-xl border border-cyan-800/30 text-center';

  const featureData = [
    {
      icon: AlertTriangle,
      title: 'Real-time Alerts',
      description: 'Get instant notifications about flood risks in your area.',
    },
    {
      icon: BarChart,
      title: 'AI Predictions',
      description: 'Advanced models predict potential flood patterns.',
    },
    {
      icon: Shield,
      title: 'Safety Guidance',
      description: 'Comprehensive emergency procedures and readiness tips.',
    },
    {
      icon: Users,
      title: 'Community Reports',
      description: 'Verified crowd-sourced flood reporting from citizens.',
    },
  ];

  const partnerData = Object.entries(PARTNER_LINKS).map(([title, link]) => ({
    title,
    link,
  }));

  return (
    <div className="pt-0 min-h-screen bg-slate-950 text-white font-sans">
      {/* 1. Hero Section */}
      <header
        className="bg-cover bg-center pt-16"
        style={{
          backgroundImage:
            'linear-gradient(180deg, rgba(15,23,42,0.95), rgba(15,23,42,0.9))',
          minHeight: '65vh',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 text-center py-24">
          <div className="inline-block px-3 py-1 text-xs font-semibold text-cyan-400 bg-cyan-900/50 rounded-full border border-cyan-700/50 mb-4 uppercase">
            AI-Powered Flood Prediction
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight mb-4">
            Protecting India from{' '}
            <span className="text-cyan-400">Flood Disasters</span>
          </h1>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto mb-8">
            Real-time insights, early warnings, and community-driven resilience
            for a safer India. Our AI monitors rainfall, rivers, and terrain to
            predict floods before they strike.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => onPageChange('LiveMap')}
              className="px-6 py-3 bg-cyan-600 text-white font-bold rounded-lg shadow-xl hover:bg-cyan-500 transition-colors flex items-center transform hover:scale-[1.02] duration-300"
            >
              <Globe size={20} className="mr-2" /> Check Flood Risk
            </button>
            <button
              onClick={() => onPageChange('Alerts')}
              className="px-6 py-3 bg-slate-700 text-white font-bold rounded-lg shadow-xl hover:bg-slate-600 transition-colors flex items-center transform hover:scale-[1.02] duration-300"
            >
              <AlertTriangle size={20} className="mr-2" /> View Alerts
            </button>
          </div>
        </div>
      </header>

      {/* 2. Live Map Preview */}
      <section className="py-12 -mt-20 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-900/90 p-6 rounded-xl border border-cyan-500/50 shadow-xl">
            <div className="flex justify-between text-xs font-semibold mb-3">
              <span className="text-green-400">Live Data Overview</span>
              <span className="text-red-400">High Risk States: 5</span>
            </div>
            <MapPreviewWidget onPageChange={onPageChange} />
          </div>
        </div>
      </section>

      {/* 3. Stats Section */}
      <section className="py-12 bg-slate-900/50 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-3 gap-8">
          <div className={statCardClass}>
            <div className="text-4xl font-extrabold text-cyan-400">500+</div>
            <div className="text-sm text-gray-400 mt-1">Cities Monitored</div>
          </div>
          <div className={statCardClass}>
            <div className="text-4xl font-extrabold text-green-400">10,000+</div>
            <div className="text-sm text-gray-400 mt-1">Alerts Sent</div>
          </div>
          <div className={statCardClass}>
            <div className="text-4xl font-extrabold text-red-400">50,000+</div>
            <div className="text-sm text-gray-400 mt-1">Lives Protected</div>
          </div>
        </div>
      </section>

      {/* 4. Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Advanced Flood Protection Technology
          </h2>
          <p className="text-md text-gray-400 max-w-4xl mx-auto mb-12">
            Our system combines AI prediction, satellite data, and public
            awareness to provide the most accurate flood forecasts in India.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featureData.map((f, i) => (
              <FeatureIconCard key={i} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* 5. CTA Section */}
      <section className="py-20 bg-cyan-900/20 border-t border-cyan-700/30 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-extrabold text-white mb-4">
            Stay Protected. Stay Informed.
          </h2>
          <p className="text-lg text-gray-300 mb-8">
            Join thousands of communities across India who rely on{' '}
            <strong>BlueAlert</strong> for early flood warnings and safety
            guidance.
          </p>
          <div className="flex justify-center space-x-4 flex-wrap gap-4">
            <button
              onClick={() => onPageChange('LiveMap')}
              className="px-6 py-3 bg-cyan-600 text-white font-bold rounded-lg shadow-xl hover:bg-cyan-500 transition-colors transform hover:scale-[1.02] duration-300"
            >
              Explore Interactive Map
            </button>
            <button
              onClick={() => onPageChange('Alerts')}
              className="px-6 py-3 bg-slate-700 text-white font-bold rounded-lg shadow-xl hover:bg-slate-600 transition-colors transform hover:scale-[1.02] duration-300"
            >
              Set Up Alerts
            </button>
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 pt-12 pb-6">
        <div className="max-w-7xl mx-auto px-6 text-sm text-gray-400">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-8 mb-8">
            <div>
              <div className="text-lg font-extrabold text-cyan-400 mb-2">
                BlueAlert
              </div>
              <p className="text-xs">
                AI-powered flood prediction and early warning system protecting
                communities across India.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-2">Quick Links</h3>
              <ul className="space-y-1 text-xs">
                <li>
                  <a href="#" className="hover:text-cyan-400">
                    About BlueAlert
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-cyan-400">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-cyan-400">
                    Data Sources
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-cyan-400">
                    Research Papers
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-2">Support</h3>
              <ul className="space-y-1 text-xs">
                <li>
                  <a href="#" className="hover:text-cyan-400">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-cyan-400">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-cyan-400">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-cyan-400">
                    Community Guidelines
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-2">Contact Info</h3>
              <p className="flex items-center text-xs mb-1">
                <MapPin size={12} className="mr-2" /> New Delhi, India
              </p>
              <p className="flex items-center text-xs mb-1">
                <Shield size={12} className="mr-2" /> 1800-XXX-XXXX
              </p>
              <p className="flex items-center text-xs mb-1">
                <Mail size={12} className="mr-2" /> support@bluealert.gov.in
              </p>
            </div>
          </div>

          <h3 className="font-semibold text-white mb-4 border-t border-slate-800 pt-8">
            Government Partners
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {partnerData.map((p, i) => (
              <GovernmentPartnerCard key={i} {...p} />
            ))}
          </div>

          <div className="text-center text-xs mt-8">
            <p>
              © 2025 BlueAlert. All rights reserved. A Government of India
              Initiative.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
