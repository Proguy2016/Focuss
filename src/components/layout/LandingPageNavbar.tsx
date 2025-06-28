import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../common/Button'; // Assuming a common Button component

const LandingPageNavbar: React.FC = () => {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-md shadow-xl py-4 px-8 flex justify-between items-center border-b border-gray-700">
            <div className="flex items-center">
                <Link to="/" className="flex items-center space-x-3">
                    <img src="/images/logo.png" alt="Focus Ritual Logo" className="h-10" />
                    <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-green-400 to-emerald hover:text-emerald-300 transition-colors duration-200">
                        Focus Ritual
                    </span>
                </Link>
            </div>
            <div className="space-x-4">
                <Link to="/login">
                    <button className="button">
                        Login
                    </button>
                </Link>
                <Link to="/signup">
                    <button className="button">
                        Sign Up
                    </button>
                </Link>
            </div>
        </nav>
    );
};

export default LandingPageNavbar; 