import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedBackgroundProps {
  variant?: 'default' | 'particles' | 'waves' | 'gradient' | 'fireflies';
  className?: string;
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  variant = 'fireflies',
  className = ''
}) => {
  const renderVariant = () => {
    switch (variant) {
      case 'particles':
        return <ParticleBackground />;
      case 'waves':
        return <WaveBackground />;
      case 'gradient':
        return <GradientBackground />;
      case 'fireflies':
        return <FireflyBackground />;
      default:
        return <DefaultBackground />;
    }
  };

  return (
    <div className={`fixed inset-0 -z-10 overflow-hidden ${className}`}>
      {renderVariant()}
    </div>
  );
};

const DefaultBackground: React.FC = () => (
  <div className="absolute inset-0 bg-transparent">
    <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2260%22%20height=%2260%22%20viewBox=%220%200%2060%2060%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill=%22none%22%20fill-rule=%22evenodd%22%3E%3Cg%20fill=%22%2304d9d9%22%20fill-opacity=%220.05%22%3E%3Ccircle%20cx=%2230%22%20cy=%2230%22%20r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20" />
  </div>
);

const FireflyBackground: React.FC = () => (
  <div className="absolute inset-0">
    {Array.from({ length: 25 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full bg-primary-500/50"
        style={{
          willChange: 'transform, opacity',
          width: Math.random() * 5 + 2,
          height: Math.random() * 5 + 2,
          boxShadow: `0 0 ${Math.random() * 10 + 5}px rgba(52, 211, 153, 0.7)`,
        }}
        initial={{
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          opacity: Math.random() * 0.5,
        }}
        animate={{
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          opacity: [0, Math.random() * 0.6, 0],
        }}
        transition={{
          duration: Math.random() * 20 + 15,
          repeat: Infinity,
          repeatType: 'loop',
          ease: 'easeInOut',
          delay: Math.random() * 5,
        }}
      />
    ))}
  </div>
);

const ParticleBackground: React.FC = () => (
  <div className="absolute inset-0 bg-transparent">
    {Array.from({ length: 50 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 bg-white rounded-full opacity-30"
        style={{ willChange: 'transform, opacity' }}
        initial={{
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
        }}
        animate={{
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
        }}
        transition={{
          duration: Math.random() * 20 + 10,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'linear',
        }}
      />
    ))}
  </div>
);

const WaveBackground: React.FC = () => (
  <div className="absolute inset-0 bg-transparent">
    <svg
      className="absolute bottom-0 w-full h-64 opacity-20"
      viewBox="0 0 1200 320"
      xmlns="http://www.w3.org/2000/svg"
    >
      <motion.path
        fill="url(#wave-gradient)"
        initial={{ d: "M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" }}
        animate={{
          d: [
            "M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
            "M0,128L48,144C96,160,192,192,288,192C384,192,480,160,576,144C672,128,768,128,864,144C960,160,1056,192,1152,192C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
            "M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <defs>
        <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--primary-dark)" />
          <stop offset="50%" stopColor="var(--primary)" />
          <stop offset="100%" stopColor="var(--emerald)" />
        </linearGradient>
      </defs>
    </svg>
  </div>
);

const GradientBackground: React.FC = () => (
  <motion.div
    className="absolute inset-0"
    animate={{
      background: [
        'linear-gradient(45deg, var(--darker), var(--dark), var(--darker))',
        'linear-gradient(45deg, var(--dark), var(--primary-dark), var(--dark))',
        'linear-gradient(45deg, var(--primary-dark), var(--primary), var(--primary-dark))',
        'linear-gradient(45deg, var(--primary), var(--darker), var(--primary))',
        'linear-gradient(45deg, var(--darker), var(--dark), var(--darker))',
      ]
    }}
    transition={{
      duration: 20,
      repeat: Infinity,
      ease: 'linear',
    }}
  />
);