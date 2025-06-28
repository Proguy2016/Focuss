import React, { useState } from 'react';
import { Button } from '../../components/common/Button'; // Assuming you have a common Button component
import { Check, Zap, Users, ShieldCheck } from 'lucide-react';

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
    <div className={`relative flex flex-col p-8 rounded-xl shadow-2xl transition-all duration-300 ease-in-out group
      ${isPopular
        ? 'bg-emerald-700/30 border-2 border-emerald-500 hover:shadow-emerald-500/40'
        : 'bg-slate-800/60 backdrop-blur-md border border-slate-700/80 hover:border-slate-600/90 hover:shadow-slate-500/20'
      }`}>
      {/* Optional: Subtle gradient overlay for depth, more pronounced on popular card */}
      <div className={`absolute inset-0 rounded-xl opacity-50 group-hover:opacity-70 transition-opacity duration-300 ${isPopular ? 'bg-gradient-to-br from-emerald-600/20 via-transparent to-emerald-600/10' : 'bg-gradient-to-br from-white/5 via-transparent to-transparent'}`}></div>

      {isPopular && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1.5 text-xs font-semibold tracking-wide text-white uppercase bg-emerald-500 rounded-full shadow-lg z-10">
          Most Popular
        </div>
      )}

      {/* Content needs to be above the decorative overlay */}
      <div className="relative z-10 flex flex-col flex-grow">
        <div className="flex-shrink-0 mb-6 text-center">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 transition-colors duration-300
            ${isPopular ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-700/50 group-hover:bg-slate-600/70 text-emerald-400'}`}>
            {icon}
          </div>
          <h3 className="text-2xl font-bold text-gray-200">{name}</h3>
          <p className={`mt-2 text-4xl font-extrabold transition-colors duration-300 ${isPopular ? 'text-emerald-300' : 'text-gray-200'}`}>{price}</p>
          <p className="text-sm text-gray-400">{priceDescription}</p>
        </div>

        <ul className="flex-grow space-y-3 mb-8">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className={`w-5 h-5 mr-3 mt-1 flex-shrink-0 transition-colors duration-300 ${isPopular ? 'text-emerald-300' : 'text-emerald-500'}`} />
              <span className={`${isPopular ? 'text-gray-200' : 'text-gray-300'}`}>{feature}</span>
            </li>
          ))}
        </ul>

        <Button
          variant={isPopular ? 'primary' : 'secondary'}
          className={`w-full py-3 text-base font-semibold rounded-lg shadow-md transition-all duration-300 transform group-hover:scale-105
            ${isPopular
              ? 'bg-emerald-500 hover:bg-emerald-400 text-white ring-2 ring-emerald-600 hover:ring-emerald-500'
              : 'bg-slate-700/70 hover:bg-slate-600/90 text-emerald-300 border border-slate-600 hover:border-emerald-500/70'
            }`}
        >
          {ctaText}
        </Button>
      </div>
    </div>
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
        icon: <ShieldCheck size={28} />,
        features: [
          'All Focus Tools & Analytics',
          'Unlimited AI Flashcards & Summaries',
          'Full Community Access & Creation',
          'Premium Soundscapes & Themes',
          '5 Collaboration Rooms (10 members each)',
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
        icon: <ShieldCheck size={28} />,
        features: [
          'All Focus Tools & Analytics',
          'Unlimited AI Flashcards & Summaries',
          'Full Community Access & Creation',
          'Premium Soundscapes & Themes',
          '5 Collaboration Rooms (10 members each)',
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
    <section id="pricing" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-dark">
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
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors
                  ${billingCycle === 'monthly' ? 'bg-emerald-500 text-white shadow-sm' : 'text-gray-300 hover:bg-white/5'}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annually')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors relative
                  ${billingCycle === 'annually' ? 'bg-emerald-500 text-white shadow-sm' : 'text-gray-300 hover:bg-white/5'}`}
              >
                Annually
                <span className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs px-2 py-0.5 rounded-full transform scale-90">SAVE 20%</span>
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
