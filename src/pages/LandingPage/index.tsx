import React from 'react';
import Hero from './Hero';
import Features from './Features';
import WhyFocusRitual from './WhyFocusRitual';
import Pricing from './Pricing';
import Footer from './Footer';
import ParallaxCTA from './ParallaxCTA';
import LandingPageNavbar from '../../components/layout/LandingPageNavbar';
// Removed AnimatedBackground import as it's handled by App.tsx

const LandingPage: React.FC = () => {
  return (
    // Ensure this div doesn't conflict with App.tsx's AnimatedBackground
    // It should primarily be a container for the sections.
    // The actual background (AnimatedBackground) is rendered by App.tsx
    <div className="text-white font-sans relative z-10">
      <LandingPageNavbar />
      {/* Removed bg-dark as App.tsx and AnimatedBackground handle global background */}
      <Hero />
      <Features />
      <ParallaxCTA />
      <WhyFocusRitual />
      <Pricing />
      <Footer />
    </div>
  );
};

export default LandingPage;
