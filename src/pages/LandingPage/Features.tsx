import React from 'react';
import { Zap, Users, BookOpen, Clock, Volume2, Sparkles } from 'lucide-react'; // Assuming lucide-react for icons
import { motion } from 'framer-motion';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
  style?: React.CSSProperties;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, className, style }) => {
  return (
    <div
      className={`relative overflow-hidden bg-gray-900/80 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-gray-700 transition-all duration-300 ease-in-out group hover:shadow-emerald-500/60 hover:border-emerald-500 ${className}`}
      style={style}
    >
      {/* Subtle decorative element */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>

      <div className="relative z-10"> {/* Content needs to be above the decorative element */}
        <div className="flex items-center justify-center w-16 h-16 bg-emerald-600/30 group-hover:bg-emerald-500/40 rounded-lg mb-6 text-emerald-300 group-hover:text-emerald-200 transition-colors duration-300">
          {icon}
        </div>
        <h3 className="text-2xl font-bold text-gray-200 mb-3">{title}</h3>
        <p className="text-gray-300 text-base leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

const Features: React.FC = () => {
  const featuresData = [
    {
      icon: <Users size={32} />,
      title: 'Communities with Levels 🤝',
      description: 'Level up your focus journey alongside like-minded individuals. Engage, motivate, and grow together.',
    },
    {
      icon: <Sparkles size={32} />, // Changed from Zap to Sparkles for AI
      title: 'AI Flashcards & Summaries 🧠',
      description: 'Optimize your learning with intelligent, AI-generated flashcards and concise summaries tailored to your study materials.',
    },
    {
      icon: <Clock size={32} />,
      title: 'Focus Timer & Analytics ⏱️',
      description: 'Master your time and enhance concentration with our customizable Pomodoro timer and detailed session analytics.',
    },
    {
      icon: <Users size={32} />, // Re-using Users icon, consider a more specific one for collaboration
      title: 'Real-time Collaboration 🧑‍💻',
      description: 'Study and work together seamlessly with friends. Share resources, track progress, and stay motivated.',
    },
    {
      icon: <Volume2 size={32} />,
      title: 'Themes & Soundscapes 🎶',
      description: 'Personalize your environment with stunning themes and immersive soundscapes designed to boost focus.',
    },
    {
      icon: <BookOpen size={32} />,
      title: 'Integrated Knowledge Hub 📚',
      description: 'Centralize your notes, PDFs, and web articles. Our AI helps you find information instantly.',
    },
  ];

  return (
    <section id="features" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 relative bg-gradient-to-b from-dark/80 to-dark">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1518707161404-5853f65b5d84?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(2px)'
        }}></div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
            Everything You Need to <span className="text-emerald-400">Achieve Deep Focus</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Focus Ritual combines powerful tools and a supportive community to help you conquer distractions and achieve your goals.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuresData.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
            >
              <FeatureCard
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 200}ms` }} // Staggered animation
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
