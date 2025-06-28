import React from 'react';
import { CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const WhyFocusRitual: React.FC = () => {
  const painPoints = [
    "Scattered tools and constant app-switching.",
    "Difficulty maintaining focus in distracting digital environments.",
    "Lack of integrated collaboration for study or work groups.",
    "Generic productivity apps that don't cater to deep work.",
  ];

  const solutions = [
    "All-in-one platform for focus, learning, and collaboration.",
    "AI-powered insights to optimize your work patterns.",
    "Immersive themes and soundscapes to create your ideal workspace.",
    "Community features to keep you motivated and accountable.",
  ];

  return (
    <section id="why-us" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-dark/90 backdrop-blur-md overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
            Stop Juggling, Start <span className="text-emerald-400">Achieving</span>.
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            If you're tired of fragmented workflows and constant distractions, Focus Ritual is designed for you. We understand the challenges faced by ambitious students and professionals.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="bg-white/5 p-8 rounded-xl border border-white/10 shadow-xl"
          >
            <h3 className="text-2xl font-semibold text-gray-200 mb-6 text-center">Are You Facing These Challenges?</h3>
            <ul className="space-y-3">
              {painPoints.map((point, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-start"
                >
                  <CheckCircle className="w-5 h-5 text-red-400 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-gray-300">{point}</span>
                </motion.li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-gray-400 text-center">
              Many users of Notion, ClickUp, or Discord for group study/work struggle with these.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-emerald-500/10 p-8 rounded-xl border border-emerald-500/30 shadow-xl"
          >
            <h3 className="text-2xl font-semibold text-gray-200 mb-6 text-center">Focus Ritual Offers a Better Way:</h3>
            <ul className="space-y-3">
              {solutions.map((solution, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-start"
                >
                  <CheckCircle className="w-5 h-5 text-emerald-400 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-gray-200">{solution}</span>
                </motion.li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-emerald-300 text-center">
              Experience an integrated environment built for deep work and peak performance.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default WhyFocusRitual;
