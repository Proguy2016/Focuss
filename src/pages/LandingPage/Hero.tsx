import React from 'react';
import { Button } from '../../components/common/Button'; // Assuming you have a common Button component

const Hero: React.FC = () => {
  return (
    <section className="min-h-screen relative flex items-center justify-center text-center px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-darker via-dark to-dark/80 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1518707161404-5853f65b5d84?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>

      <div className="max-w-3xl mx-auto relative z-10"> {/* Ensure content is above background */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-emerald-400 animate-fade-in">
          Unlock Unprecedented Focus.
        </h1>
        <h2 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-bold text-gray-300 animate-fade-in animation-delay-500">
          Discover the Ritual.
        </h2>
        <p className="mt-8 text-lg sm:text-xl text-gray-300 max-w-xl mx-auto animate-fade-in animation-delay-1000">
          Join a community of high-achievers, master your workflow, and elevate your productivity with AI-powered tools and immersive soundscapes.
        </p>
        <div className="mt-12 animate-fade-in animation-delay-1500">
          <button className="hero-button">
            Request Early Access
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;

// Add this to your tailwind.config.js if you don't have animation-delay utilities
// plugins: [
//   function ({ addUtilities }) {
//     const newUtilities = {
//       '.animation-delay-500': {
//         'animation-delay': '0.5s',
//       },
//       '.animation-delay-1000': {
//         'animation-delay': '1s',
//       },
//       '.animation-delay-1500': {
//         'animation-delay': '1.5s',
//       },
//     }
//     addUtilities(newUtilities, ['responsive', 'hover'])
//   }
// ],
