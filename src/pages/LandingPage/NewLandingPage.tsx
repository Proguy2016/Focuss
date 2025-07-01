import React, { useEffect } from 'react';

const NewLandingPage = () => {
    useEffect(() => {
        // Simple script to handle mobile menu toggle
        const mobileMenuButton = document.querySelector('[aria-controls="mobile-menu"]');
        if (mobileMenuButton) {
            mobileMenuButton.addEventListener('click', function () {
                // You would implement mobile menu functionality here
                console.log('Mobile menu toggled');
            });
        }

        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();

                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);

                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }, []);

    return (
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white font-sans">
            <style>
                {`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in {
                    animation: fadeIn 1s ease-out forwards;
                }
                .animation-delay-500 {
                    animation-delay: 0.5s;
                }
                .animation-delay-1000 {
                    animation-delay: 1s;
                }
                .animation-delay-1500 {
                    animation: fadeIn 1.5s ease-out forwards;
                }
                .hero-button {
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
                    transition: all 0.3s ease;
                }
                .hero-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.6);
                }
                .feature-card:hover .feature-icon {
                    transform: translateY(-5px) rotate(3deg) scale(1.1);
                    box-shadow: 0 10px 20px -5px rgba(16, 185, 129, 0.3);
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .pricing-card-popular:hover {
                    animation: float 3s ease-in-out infinite;
                }
                .pricing-card-popular:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 20px 25px -5px rgba(16, 185, 129, 0.1), 0 10px 10px -5px rgba(16, 185, 129, 0.04);
                }
                .pricing-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                }
                .discord-card:hover {
                    box-shadow: 0 0 20px rgba(99, 102, 241, 0.5);
                }
                .discord-card:hover .discord-icon {
                    transform: scale(1.1);
                }
                `}
            </style>
            {/* Navbar */}
            <nav className="fixed w-full bg-gray-900/80 backdrop-blur-md z-50 border-b border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">Focus Ritual</span>
                            </div>
                        </div>
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-8">
                                <a href="#features" className="text-gray-300 hover:text-emerald-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">Features</a>
                                <a href="#why-us" className="text-gray-300 hover:text-emerald-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">Why Us?</a>
                                <a href="#pricing" className="text-gray-300 hover:text-emerald-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">Pricing</a>
                                <a href="#" className="text-gray-300 hover:text-emerald-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">Blog</a>
                            </div>
                        </div>
                        <div className="hidden md:block">
                            <div className="ml-4 flex items-center md:ml-6">
                                <button className="px-4 py-2 border border-emerald-500 text-emerald-400 rounded-md text-sm font-medium hover:bg-emerald-500/10 transition-colors">
                                    Sign In
                                </button>
                                <button className="ml-4 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-md text-sm font-medium hover:from-emerald-600 hover:to-green-600 transition-all">
                                    Get Started
                                </button>
                            </div>
                        </div>
                        <div className="-mr-2 flex md:hidden">
                            <button type="button" className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none" aria-controls="mobile-menu" aria-expanded="false">
                                <span className="sr-only">Open main menu</span>
                                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="min-h-screen relative flex items-center justify-center text-center px-4 sm:px-6 lg:px-8 pt-20 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-emerald-900/30 to-gray-900"></div>
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1518707161404-5853f65b5d84?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')", backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-900/90"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-gray-900/80 to-gray-900"></div>
                </div>

                <div className="max-w-3xl mx-auto relative z-10">
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
                        <button className="hero-button px-8 py-3 text-lg font-semibold rounded-lg text-white">
                            Request Early Access
                        </button>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-900/95 via-gray-900/90 to-gray-900">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
                            Everything You Need to <span className="text-emerald-400">Achieve Deep Focus</span>
                        </h2>
                        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                            Focus Ritual combines powerful tools and a supportive community to help you conquer distractions and achieve your goals.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="feature-card relative overflow-hidden bg-gray-800/20 p-8 rounded-2xl border border-gray-700/50 transition-all duration-500 hover:border-emerald-400/50 hover:shadow-lg hover:shadow-emerald-500/10 group">
                            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/0 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 group-hover:scale-150"></div>
                            <div className="feature-icon flex items-center justify-center w-16 h-16 bg-emerald-500/20 rounded-lg mb-6 text-emerald-400 transition-transform duration-300">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="9" cy="7" r="4"></circle>
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-200 mb-3">Communities with Levels 🤝</h3>
                            <p className="text-gray-300">Level up your focus journey alongside like-minded individuals. Engage, motivate, and grow together.</p>
                        </div>

                        {/* Feature 2 */}
                        <div className="feature-card bg-gray-800/50 p-8 rounded-xl border border-gray-700 transition-all duration-300 hover:border-emerald-500">
                            <div className="feature-icon flex items-center justify-center w-16 h-16 bg-emerald-500/20 rounded-lg mb-6 text-emerald-400 transition-transform duration-300">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-200 mb-3">AI Flashcards & Summaries 🧠</h3>
                            <p className="text-gray-300">Optimize your learning with intelligent, AI-generated flashcards and concise summaries tailored to your study materials.</p>
                        </div>

                        {/* Feature 3 */}
                        <div className="feature-card bg-gray-800/50 p-8 rounded-xl border border-gray-700 transition-all duration-300 hover:border-emerald-500">
                            <div className="feature-icon flex items-center justify-center w-16 h-16 bg-emerald-500/20 rounded-lg mb-6 text-emerald-400 transition-transform duration-300">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-200 mb-3">Focus Timer & Analytics ⏱️</h3>
                            <p className="text-gray-300">Master your time and enhance concentration with our customizable Pomodoro timer and detailed session analytics.</p>
                        </div>

                        {/* Feature 4 */}
                        <div className="feature-card bg-gray-800/50 p-8 rounded-xl border border-gray-700 transition-all duration-300 hover:border-emerald-500">
                            <div className="feature-icon flex items-center justify-center w-16 h-16 bg-emerald-500/20 rounded-lg mb-6 text-emerald-400 transition-transform duration-300">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="9" cy="7" r="4"></circle>
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-200 mb-3">Real-time Collaboration 🧑‍💻</h3>
                            <p className="text-gray-300">Study and work together seamlessly with friends. Share resources, track progress, and stay motivated.</p>
                        </div>

                        {/* Feature 5 */}
                        <div className="feature-card bg-gray-800/50 p-8 rounded-xl border border-gray-700 transition-all duration-300 hover:border-emerald-500">
                            <div className="feature-icon flex items-center justify-center w-16 h-16 bg-emerald-500/20 rounded-lg mb-6 text-emerald-400 transition-transform duration-300">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-200 mb-3">Themes & Soundscapes 🎶</h3>
                            <p className="text-gray-300">Personalize your environment with stunning themes and immersive soundscapes designed to boost focus.</p>
                        </div>

                        {/* Feature 6 */}
                        <div className="feature-card bg-gray-800/50 p-8 rounded-xl border border-gray-700 transition-all duration-300 hover:border-emerald-500">
                            <div className="feature-icon flex items-center justify-center w-16 h-16 bg-emerald-500/20 rounded-lg mb-6 text-emerald-400 transition-transform duration-300">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-200 mb-3">Integrated Knowledge Hub 📚</h3>
                            <p className="text-gray-300">Centralize your notes, PDFs, and web articles. Our AI helps you find information instantly.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Us Section */}
            <section id="why-us" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-900/95 via-gray-900/90 to-gray-900 backdrop-blur-sm">
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
                        {/* Challenges Card */}
                        <div className="bg-gray-800/50 p-8 rounded-xl border border-gray-700 shadow-xl">
                            <h3 className="text-2xl font-semibold text-gray-200 mb-6 text-center">Are You Facing These Challenges?</h3>
                            <ul className="space-y-3">
                                <li className="flex items-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 mt-1 flex-shrink-0">
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                    </svg>
                                    <span className="text-gray-300">Scattered tools and constant app-switching.</span>
                                </li>
                                <li className="flex items-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 mt-1 flex-shrink-0">
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                    </svg>
                                    <span className="text-gray-300">Difficulty maintaining focus in distracting digital environments.</span>
                                </li>
                                <li className="flex items-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 mt-1 flex-shrink-0">
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                    </svg>
                                    <span className="text-gray-300">Lack of integrated collaboration for study or work groups.</span>
                                </li>
                                <li className="flex items-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 mt-1 flex-shrink-0">
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                    </svg>
                                    <span className="text-gray-300">Generic productivity apps that don't cater to deep work.</span>
                                </li>
                            </ul>
                            <p className="mt-6 text-sm text-gray-400 text-center">
                                Many users of Notion, ClickUp, or Discord for group study/work struggle with these.
                            </p>
                        </div>

                        {/* Solutions Card */}
                        <div className="bg-emerald-500/10 p-8 rounded-xl border border-emerald-500/30 shadow-xl">
                            <h3 className="text-2xl font-semibold text-gray-200 mb-6 text-center">Focus Ritual Offers a Better Way:</h3>
                            <ul className="space-y-3">
                                <li className="flex items-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 mt-1 flex-shrink-0">
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                    </svg>
                                    <span className="text-gray-200">All-in-one platform for focus, learning, and collaboration.</span>
                                </li>
                                <li className="flex items-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 mt-1 flex-shrink-0">
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                    </svg>
                                    <span className="text-gray-200">AI-powered insights to optimize your work patterns.</span>
                                </li>
                                <li className="flex items-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 mt-1 flex-shrink-0">
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                    </svg>
                                    <span className="text-gray-200">Immersive themes and soundscapes to create your ideal workspace.</span>
                                </li>
                                <li className="flex items-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 mt-1 flex-shrink-0">
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                    </svg>
                                    <span className="text-gray-200">Community features to keep you motivated and accountable.</span>
                                </li>
                            </ul>
                            <p className="mt-6 text-sm text-emerald-300 text-center">
                                Experience an integrated environment built for deep work and peak performance.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-gray-900">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
                            Find the <span className="text-emerald-400">Perfect Plan</span> For You
                        </h2>
                        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                            Choose a plan that scales with your focus needs. Get started for free, or unlock powerful premium features.
                        </p>

                        <div className="mt-8">
                            <div className="inline-flex bg-white/5 p-1 rounded-lg border border-white/10">
                                <button className="px-6 py-2 rounded-md text-sm font-medium transition-colors bg-emerald-500 text-white shadow-sm">
                                    Monthly
                                </button>
                                <button className="px-6 py-2 rounded-md text-sm font-medium transition-colors relative text-gray-300 hover:bg-white/5">
                                    Annually
                                    <span className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs px-2 py-0.5 rounded-full transform scale-90">SAVE 20%</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8 items-stretch">
                        {/* Explorer Plan */}
                        <div className="pricing-card relative flex flex-col p-8 rounded-xl shadow-lg transition-all duration-300 ease-in-out bg-gray-800/60 backdrop-blur-md border border-gray-700/80 hover:border-gray-600/90">
                            <div className="absolute inset-0 rounded-xl opacity-50 transition-opacity duration-300 bg-gradient-to-br from-white/5 via-transparent to-transparent"></div>

                            <div className="relative z-10 flex flex-col flex-grow">
                                <div className="flex-shrink-0 mb-6 text-center">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 transition-colors duration-300 bg-gray-700/50 hover:bg-gray-600/70 text-emerald-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-200">Explorer</h3>
                                    <p className="mt-2 text-4xl font-extrabold transition-colors duration-300 text-gray-200">$9</p>
                                    <p className="text-sm text-gray-400">per month</p>
                                </div>

                                <ul className="flex-grow space-y-3 mb-8">
                                    <li className="flex items-start">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 mt-1 flex-shrink-0">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                        </svg>
                                        <span className="text-gray-300">Access to Core Focus Tools</span>
                                    </li>
                                    <li className="flex items-start">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 mt-1 flex-shrink-0">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                        </svg>
                                        <span className="text-gray-300">Basic AI Flashcards (20/day)</span>
                                    </li>
                                    <li className="flex items-start">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 mt-1 flex-shrink-0">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                        </svg>
                                        <span className="text-gray-300">Community Access (Read-only)</span>
                                    </li>
                                    <li className="flex items-start">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 mt-1 flex-shrink-0">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                        </svg>
                                        <span className="text-gray-300">Limited Soundscapes & Themes</span>
                                    </li>
                                    <li className="flex items-start">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 mt-1 flex-shrink-0">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                        </svg>
                                        <span className="text-gray-300">1 Collaboration Room (2 members)</span>
                                    </li>
                                </ul>

                                <button className="w-full py-3 text-base font-semibold rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 bg-gray-700/70 hover:bg-gray-600/90 text-emerald-300 border border-gray-600 hover:border-emerald-500/70">
                                    Start Exploring
                                </button>
                            </div>
                        </div>

                        {/* Popular Plan */}
                        <div className="pricing-card-popular relative flex flex-col p-8 rounded-2xl shadow-2xl transition-all duration-500 ease-in-out group bg-gradient-to-br from-gray-800/80 via-gray-800/60 to-gray-900/80 border border-emerald-500/30 hover:border-emerald-400/60 hover:shadow-[0_20px_50px_-15px_rgba(16,185,129,0.3)]">
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-emerald-500/5 group-hover:to-emerald-500/10 transition-all duration-700"></div>
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1.5 text-xs font-semibold tracking-wide text-white uppercase bg-emerald-500 rounded-full shadow-lg z-10">
                                Most Popular
                            </div>
                            <div className="absolute inset-0 rounded-xl opacity-50 group-hover:opacity-70 transition-opacity duration-300 bg-gradient-to-br from-emerald-600/20 via-transparent to-emerald-600/10"></div>

                            <div className="relative z-10 flex flex-col flex-grow">
                                <div className="flex-shrink-0 mb-6 text-center">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 transition-colors duration-300 bg-emerald-500 text-white shadow-lg">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-200">Ritual Master</h3>
                                    <p className="mt-2 text-4xl font-extrabold transition-colors duration-300 text-emerald-300">$19</p>
                                    <p className="text-sm text-gray-400">per month</p>
                                </div>

                                <ul className="flex-grow space-y-3 mb-8">
                                    <li className="flex items-start">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 mt-1 flex-shrink-0 text-emerald-300">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                        </svg>
                                        <span className="text-gray-200">All Focus Tools & Analytics</span>
                                    </li>
                                    <li className="flex items-start">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 mt-1 flex-shrink-0 text-emerald-300">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                        </svg>
                                        <span className="text-gray-200">Unlimited AI Flashcards & Summaries</span>
                                    </li>
                                    <li className="flex items-start">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 mt-1 flex-shrink-0 text-emerald-300">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                        </svg>
                                        <span className="text-gray-200">Full Community Access & Creation</span>
                                    </li>
                                    <li className="flex items-start">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 mt-1 flex-shrink-0 text-emerald-300">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                        </svg>
                                        <span className="text-gray-200">Premium Soundscapes & Themes</span>
                                    </li>
                                    <li className="flex items-start">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 mt-1 flex-shrink-0 text-emerald-300">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                        </svg>
                                        <span className="text-gray-200">5 Collaboration Rooms (10 members each)</span>
                                    </li>
                                    <li className="flex items-start">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 mt-1 flex-shrink-0 text-emerald-300">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                        </svg>
                                        <span className="text-gray-200">AI Coach (Beta)</span>
                                    </li>
                                    <li className="flex items-start">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 mt-1 flex-shrink-0 text-emerald-300">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                        </svg>
                                        <span className="text-gray-200">Priority Support</span>
                                    </li>
                                </ul>

                                <button className="w-full py-3 text-base font-semibold rounded-lg shadow-md transition-all duration-300 transform group-hover:scale-105 bg-emerald-500 hover:bg-emerald-400 text-white ring-2 ring-emerald-600 hover:ring-emerald-500">
                                    Master Your Ritual
                                </button>
                            </div>
                        </div>

                        {/* Team Plan */}
                        <div className="pricing-card relative flex flex-col p-8 rounded-xl shadow-lg transition-all duration-300 ease-in-out bg-gray-800/60 backdrop-blur-md border border-gray-700/80 hover:border-gray-600/90">
                            <div className="absolute inset-0 rounded-xl opacity-50 transition-opacity duration-300 bg-gradient-to-br from-white/5 via-transparent to-transparent"></div>

                            <div className="relative z-10 flex flex-col flex-grow">
                                <div className="flex-shrink-0 mb-6 text-center">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 transition-colors duration-300 bg-gray-700/50 hover:bg-gray-600/70 text-emerald-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                            <circle cx="9" cy="7" r="4"></circle>
                                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-200">Focused Team</h3>
                                    <p className="mt-2 text-4xl font-extrabold transition-colors duration-300 text-gray-200">$49</p>
                                    <p className="text-sm text-gray-400">per month (up to 5 users)</p>
                                </div>

                                <ul className="flex-grow space-y-3 mb-8">
                                    <li className="flex items-start">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 mt-1 flex-shrink-0">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                        </svg>
                                        <span className="text-gray-300">All Ritual Master Features</span>
                                    </li>
                                    <li className="flex items-start">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 mt-1 flex-shrink-0">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                        </svg>
                                        <span className="text-gray-300">Team Management Dashboard</span>
                                    </li>
                                    <li className="flex items-start">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 mt-1 flex-shrink-0">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                        </svg>
                                        <span className="text-gray-300">Shared Collaboration Spaces</span>
                                    </li>
                                    <li className="flex items-start">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 mt-1 flex-shrink-0">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                        </svg>
                                        <span className="text-gray-300">Centralized Billing</span>
                                    </li>
                                    <li className="flex items-start">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 mt-1 flex-shrink-0">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                        </svg>
                                        <span className="text-gray-300">Team-Level Analytics</span>
                                    </li>
                                    <li className="flex items-start">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 mt-1 flex-shrink-0">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                        </svg>
                                        <span className="text-gray-300">Dedicated Onboarding Support</span>
                                    </li>
                                </ul>

                                <button className="w-full py-3 text-base font-semibold rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 bg-gray-700/70 hover:bg-gray-600/90 text-emerald-300 border border-gray-600 hover:border-emerald-500/70">
                                    Empower Your Team
                                </button>
                            </div>
                        </div>
                    </div>

                    <p className="text-center text-gray-400 mt-12 text-sm">
                        All prices are in USD. You can upgrade, downgrade, or cancel your plan at any time.
                    </p>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 py-8 sm:py-10 px-4 sm:px-6 lg:px-8 border-t border-gray-700">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        {/* Logo and Description */}
                        <div>
                            <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">Focus Ritual</span>
                            <p className="text-gray-400 text-xs leading-relaxed max-w-xs mt-3">
                                Elevate your focus, achieve your goals. Focus Ritual is your dedicated space for deep work and productivity.
                            </p>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h5 className="text-md font-semibold text-white mb-3">Quick Links</h5>
                            <ul className="space-y-1">
                                <li><a href="#features" className="text-gray-400 hover:text-emerald-400 transition-colors duration-200 text-xs">Features</a></li>
                                <li><a href="#pricing" className="text-gray-400 hover:text-emerald-400 transition-colors duration-200 text-xs">Pricing</a></li>
                                <li><a href="#why-us" className="text-gray-400 hover:text-emerald-400 transition-colors duration-200 text-xs">Why Us?</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors duration-200 text-xs">Blog</a></li>
                                <li><a href="mailto:support@focusritual.com" className="text-gray-400 hover:text-emerald-400 transition-colors duration-200 text-xs">Contact</a></li>
                            </ul>
                        </div>

                        {/* Legal and Social */}
                        <div>
                            <h5 className="text-md font-semibold text-white mb-3">Connect & Legal</h5>

                            {/* Discord Card */}
                            <div className="discord-card group relative p-4 rounded-2xl backdrop-blur-xl border-2 border-indigo-500/30 bg-gradient-to-br from-indigo-900/40 via-black-900/60 to-black/80 shadow-2xl hover:shadow-indigo-500/30 hover:shadow-2xl transition-all duration-500 ease-out cursor-pointer hover:border-indigo-400/60 overflow-hidden mb-6">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-400/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-indigo-400/20 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                <div className="relative z-10 flex items-center gap-4">
                                    <div className="discord-icon p-3 rounded-lg bg-gradient-to-br from-indigo-500/30 to-indigo-600/10 backdrop-blur-sm group-hover:from-indigo-400/40 group-hover:to-indigo-500/20 transition-all duration-300">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" className="w-7 h-7 fill-current text-indigo-400 group-hover:text-indigo-300 transition-all duration-300 group-hover:scale-110 drop-shadow-lg">
                                            <path d="M524.531 69.836a1.5 1.5 0 0 0-.764-.7A485.065 485.065 0 0 0 404.081 32.03a1.816 1.816 0 0 0-1.923.91 337.461 337.461 0 0 0-14.9 30.6 447.848 447.848 0 0 0-134.426 0 309.541 309.541 0 0 0-15.135-30.6 1.89 1.89 0 0 0-1.924-.91 483.689 483.689 0 0 0-119.688 37.107 1.712 1.712 0 0 0-.788.676C39.068 183.651 18.186 294.69 28.43 404.354a2.016 2.016 0 0 0 .765 1.375 487.666 487.666 0 0 0 146.825 74.189 1.9 1.9 0 0 0 2.063-.676A348.2 348.2 0 0 0 208.12 430.4a1.86 1.86 0 0 0-1.019-2.588 321.173 321.173 0 0 1-45.868-21.853 1.885 1.885 0 0 1-.185-3.126 251.047 251.047 0 0 0 9.109-7.137 1.819 1.819 0 0 1 1.9-.256c96.229 43.917 200.41 43.917 295.5 0a1.812 1.812 0 0 1 1.924.233 234.533 234.533 0 0 0 9.132 7.16 1.884 1.884 0 0 1-.162 3.126 301.407 301.407 0 0 1-45.89 21.83 1.875 1.875 0 0 0-1 2.611 391.055 391.055 0 0 0 30.014 48.815 1.864 1.864 0 0 0 2.063.7A486.048 486.048 0 0 0 610.7 405.729a1.882 1.882 0 0 0 .765-1.352c12.264-126.783-20.532-236.912-86.934-334.541zM222.491 337.58c-28.972 0-52.844-26.587-52.844-59.239s23.409-59.241 52.844-59.241c29.665 0 53.306 26.82 52.843 59.239 0 32.654-23.41 59.241-52.843 59.241zm195.38 0c-28.971 0-52.843-26.587-52.843-59.239s23.409-59.241 52.843-59.241c29.667 0 53.307 26.820 52.844 59.239 0 32.654-23.177 59.241-52.844 59.241z"></path>
                                        </svg>
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="text-indigo-400 font-bold text-lg group-hover:text-indigo-300 transition-colors duration-300 drop-shadow-sm">
                                            Discord
                                        </p>
                                        <p className="text-indigo-300/60 text-sm group-hover:text-indigo-200/80 transition-colors duration-300">
                                            Join community
                                        </p>
                                    </div>
                                    <div className="opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                                        <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" className="w-5 h-5 text-indigo-400">
                                            <path d="M9 5l7 7-7 7" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"></path>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-700 pt-6 text-center">
                        <p className="text-xs text-gray-500">
                            &copy; 2023 Focus Ritual. All rights reserved.
                        </p>
                        <p className="text-xxs text-gray-600 mt-1">
                            Crafted with <span className="text-emerald-500">&hearts;</span> for focused minds.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default NewLandingPage; 