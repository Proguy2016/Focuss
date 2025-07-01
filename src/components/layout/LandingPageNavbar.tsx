import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const LandingPageNavbar: React.FC = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Add the scrolled class when scrolled more than 50px
            setScrolled(window.scrollY > 50);
        };

        // Add scroll event listener
        window.addEventListener('scroll', handleScroll);

        // Initial check
        handleScroll();

        // Clean up
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 py-4 px-8 flex justify-between items-center transition-all duration-300 ${scrolled
            ? 'bg-gray-900/80 backdrop-blur-md shadow-xl border-b border-gray-700'
            : 'bg-transparent'
            }`}>
            <div className="flex items-center">
                <Link to="/" className="flex items-center space-x-3 group">
                    <img src="/images/logo.png" alt="Focus Ritual Logo" className="h-10 filter brightness-125 contrast-125 drop-shadow-lg" />
                    <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-green-400 to-emerald hover:text-emerald-300 transition-colors duration-200">
                        Focus Ritual
                    </span>
                </Link>
            </div>
            <div className="space-x-4">
                <Link to="/login">
                    <button className={`px-5 py-2 rounded-full transition-all duration-300 ${scrolled
                        ? 'bg-transparent hover:bg-white/10 text-white'
                        : 'bg-white/20 hover:bg-white/30 text-white font-medium'
                        }`}>
                        Login
                    </button>
                </Link>
                <Link to="/signup">
                    <button className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full transition-all duration-300 font-medium shadow-md hover:shadow-lg">
                        Sign Up
                    </button>
                </Link>
            </div>
        </nav>
    );
};

export default LandingPageNavbar; 