import React from 'react';
import { Menu } from 'lucide-react';

const Navbar = ({ currentPage, setPage }) => (
    <header className="fixed top-0 left-0 right-0 z-40 bg-slate-900/90 backdrop-blur-sm shadow-xl shadow-slate-900/50 w-full">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center w-full">
            <div className="text-3xl font-extrabold text-cyan-400 tracking-wider cursor-pointer" onClick={() => setPage('Home')}>
                Blue<span className="text-white">Alert</span>
            </div>
            
            <nav className="hidden md:flex space-x-8 font-medium">
                {['Home', 'Live Map', 'Analytics', 'Alerts', 'Safety'].map((item) => (
                    <button
                        key={item}
                        onClick={() => setPage(item)}
                        className={`text-sm tracking-wide uppercase transition-colors duration-200 ${
                            currentPage === item ? 'text-cyan-400 font-bold border-b-2 border-cyan-400' : 'text-gray-300 hover:text-cyan-400'
                        }`}
                    >
                        {item}
                    </button>
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

export default Navbar;