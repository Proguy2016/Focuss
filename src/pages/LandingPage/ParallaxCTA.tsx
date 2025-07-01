import React from 'react';
import { motion } from 'framer-motion';

const ParallaxCTA: React.FC = () => {
    return (
        <section
            className="relative h-[700px] bg-fixed bg-center bg-no-repeat bg-cover"
            style={{
                backgroundImage: 'url("https://images.unsplash.com/photo-1448375240586-882707db888b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80")'
            }}
        >
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
                <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.8 }}
                    className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6 tracking-tight"
                >
                    Ready to Transform Your <span className="text-emerald-400">Focus Journey</span>?
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-base md:text-lg text-gray-200 max-w-2xl mb-10 leading-relaxed"
                >
                    Join thousands of students and professionals who have elevated their productivity and well-being with Focus Ritual.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="flex flex-col sm:flex-row gap-4 sm:gap-6"
                >
                    <a
                        href="#pricing"
                        className="px-7 py-3.5 bg-emerald-500 hover:bg-transparent text-white font-bold rounded-full transition-all duration-300 transform hover:scale-105 inline-block border-2 border-emerald-500"
                    >
                        Start Your Journey
                    </a>
                    <a
                        href="#features"
                        className="px-7 py-3.5 bg-transparent border-2 border-white hover:bg-white hover:text-emerald-500 text-white font-bold rounded-full transition-all duration-300 transform hover:scale-105 inline-block sm:ml-4"
                    >
                        Learn More
                    </a>
                </motion.div>
            </div>
        </section>
    );
};

export default ParallaxCTA; 