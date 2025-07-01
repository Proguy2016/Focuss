import React, { useState } from 'react';
import { Button } from '../../components/common/Button'; // Assuming you have a common Button component
import { Check, Zap, Users, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

interface PricingTierProps {
  name: string;
  price: string;
  priceDescription: string;
  features: string[];
  ctaText: string;
  isPopular?: boolean;
  icon: React.ReactNode;
}

const PricingTier: React.FC<PricingTierProps> = ({ name, price, priceDescription, features, ctaText, isPopular, icon }) => {
  return (
    <motion.div
      whileHover={isPopular ? { scale: 1.05 } : { scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className={`relative flex flex-col p-8 rounded-xl shadow-2xl transition-all duration-300 ease-in-out group
        ${isPopular
          ? 'bg-emerald-700/40 border-2 border-emerald-500 hover:shadow-emerald-500/40 transform-gpu z-10'
          : 'bg-slate-800/60 backdrop-blur-md border border-slate-700/80 hover:border-slate-600/90 hover:shadow-slate-500/20'
        }
        ${isPopular ? 'lg:-mt-8 lg:-mb-8 lg:py-12' : ''}
      `}
    >
      {/* Optional: Subtle gradient overlay for depth, more pronounced on popular card */}
      <div className={`absolute inset-0 rounded-xl opacity-50 group-hover:opacity-70 transition-opacity duration-300 ${isPopular
        ? 'bg-gradient-to-br from-emerald-600/20 via-transparent to-emerald-600/10'
        : 'bg-gradient-to-br from-white/5 via-transparent to-transparent'
        }`}></div>

      {isPopular && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-5 py-2 text-xs font-bold tracking-wide text-white uppercase bg-gradient-to-r from-emerald-500 to-green-500 rounded-full shadow-lg z-10 animate-pulse">
          Most Popular
        </div>
      )}

      {/* Content needs to be above the decorative overlay */}
      <div className="relative z-10 flex flex-col flex-grow">
        <div className="flex-shrink-0 mb-6 text-center">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 transition-colors duration-300
            ${isPopular ? 'bg-emerald-500 text-white shadow-lg lg:w-20 lg:h-20' : 'bg-slate-700/50 group-hover:bg-slate-600/70 text-emerald-400'}`}>
            {icon}
          </div>
          <h3 className={`text-2xl font-bold text-gray-200 ${isPopular ? 'lg:text-3xl' : ''}`}>{name}</h3>
          <p className={`mt-2 text-4xl font-extrabold transition-colors duration-300 ${isPopular ? 'text-emerald-300 lg:text-5xl' : 'text-gray-200'
            }`}>{price}</p>
          <p className="text-sm text-gray-400">{priceDescription}</p>
        </div>

        <ul className="flex-grow space-y-3 mb-8">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className={`w-5 h-5 mr-3 mt-1 flex-shrink-0 transition-colors duration-300 ${isPopular ? 'text-emerald-300' : 'text-emerald-500'
                }`} />
              <span className={`${isPopular ? 'text-gray-200' : 'text-gray-300'}`}>{feature}</span>
            </li>
          ))}
        </ul>

        <Button
          variant={isPopular ? 'primary' : 'secondary'}
          className={`w-full py-2.5 text-base font-semibold rounded-full shadow-md transition-all duration-300 transform group-hover:scale-105
            ${isPopular
              ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md hover:shadow-lg'
              : 'bg-slate-700/70 hover:bg-slate-600/90 text-emerald-300 border border-slate-600 hover:border-emerald-500/70'
            }
            ${isPopular ? 'lg:py-3 lg:text-base' : ''}
          `}
        >
          {ctaText}
        </Button>
      </div>
    </motion.div>
  );
};

const Pricing: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('annually');

  const tiers = {
    monthly: [
      {
        name: 'Explorer',
        price: '$9',
        priceDescription: 'per month',
        icon: <Zap size={28} />,
        features: [
          'Access to Core Focus Tools',
          'Basic AI Flashcards (20/day)',
          'Community Access (Read-only)',
          'Limited Soundscapes & Themes',
          '1 Collaboration Room (2 members)',
        ],
        ctaText: 'Start Exploring',
      },
      {
        name: 'Ritual Master',
        price: '$19',
        priceDescription: 'per month',
        icon: <ShieldCheck size={36} />,
        features: [
          'All Focus Tools & Analytics',
          'Unlimited AI Flashcards & Summaries',
          'Full Community Access & Creation',
          'Premium Soundscapes & Themes',
          'Unlimited Collaboration Rooms (10 members each)',
          'AI Coach (Beta)',
          'Priority Support',
        ],
        ctaText: 'Master Your Ritual',
        isPopular: true,
      },
      {
        name: 'Focused Team',
        price: '$49',
        priceDescription: 'per month (up to 5 users)',
        icon: <Users size={28} />,
        features: [
          'All Ritual Master Features',
          'Team Management Dashboard',
          'Shared Collaboration Spaces',
          'Centralized Billing',
          'Team-Level Analytics',
          'Dedicated Onboarding Support',
        ],
        ctaText: 'Empower Your Team',
      },
    ],
    annually: [
      {
        name: 'Explorer',
        price: '$7',
        priceDescription: 'per month, billed annually',
        icon: <Zap size={28} />,
        features: [
          'Access to Core Focus Tools',
          'Basic AI Flashcards (20/day)',
          'Community Access (Read-only)',
          'Limited Soundscapes & Themes',
          '1 Collaboration Room (2 members)',
        ],
        ctaText: 'Start Exploring',
      },
      {
        name: 'Ritual Master',
        price: '$15',
        priceDescription: 'per month, billed annually',
        icon: <ShieldCheck size={36} />,
        features: [
          'All Focus Tools & Analytics',
          'Unlimited AI Flashcards & Summaries',
          'Full Community Access & Creation',
          'Premium Soundscapes & Themes',
          'Unlimited Collaboration Rooms (10 members each)',
          'AI Coach (Beta)',
          'Priority Support',
        ],
        ctaText: 'Master Your Ritual',
        isPopular: true,
      },
      {
        name: 'Focused Team',
        price: '$39',
        priceDescription: 'per month (up to 5 users), billed annually',
        icon: <Users size={28} />,
        features: [
          'All Ritual Master Features',
          'Team Management Dashboard',
          'Shared Collaboration Spaces',
          'Centralized Billing',
          'Team-Level Analytics',
          'Dedicated Onboarding Support',
        ],
        ctaText: 'Empower Your Team',
      },
    ]
  };

  const currentTiers = tiers[billingCycle];

  return (
    <section id="pricing" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 relative bg-gradient-to-b from-dark to-darker">
      {/* Background with subtle pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1518707161404-5853f65b5d84?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(3px)'
        }}></div>
      </div>

      {/* Glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/15 rounded-full blur-[120px] opacity-50 z-0"></div>

      {/* Content */}
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
            Find the <span className="text-emerald-400">Perfect Plan</span> For You
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Choose a plan that scales with your focus needs. Get started for free, or unlock powerful premium features.
          </p>

          <div className="mt-8">
            <div className="inline-flex bg-white/5 p-1 rounded-lg border border-white/10">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors
                  ${billingCycle === 'monthly'
                    ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-sm'
                    : 'text-gray-300 hover:bg-emerald-500/20 hover:text-emerald-300'}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annually')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors relative
                  ${billingCycle === 'annually'
                    ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-sm'
                    : 'text-gray-300 hover:bg-emerald-500/20 hover:text-emerald-300'}`}
              >
                Annually
                <span className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs px-2 py-0.5 rounded-full transform scale-70">SAVE 20%</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-stretch">
          {currentTiers.map((tier, index) => (
            <PricingTier key={index} {...tier} />
          ))}
        </div>
        <p className="text-center text-gray-400 mt-12 text-sm">
          All prices are in USD. You can upgrade, downgrade, or cancel your plan at any time.
        </p>
      </div>
    </section>
  );
};

export default Pricing;
