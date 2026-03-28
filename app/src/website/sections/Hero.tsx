import { motion } from 'framer-motion';
import { ArrowRight, Play, TrendingUp, Users, Award } from 'lucide-react';

type Page = 'home' | 'about' | 'services' | 'portfolio' | 'contact' | 'case-study';

interface HeroProps {
  onNavigate: (page: Page) => void;
  heroTitle?: string;
  heroSubtitle?: string;
  projectsStat?: string;
  clientsStat?: string;
  awardsStat?: string;
}

export function Hero({
  onNavigate,
  heroTitle,
  heroSubtitle,
  projectsStat,
  clientsStat,
  awardsStat,
}: HeroProps) {
  const stats = [
    { value: projectsStat ?? '150+', label: 'Projects', icon: TrendingUp },
    { value: clientsStat ?? '80+', label: 'Clients', icon: Users },
    { value: awardsStat ?? '12', label: 'Awards', icon: Award },
  ];

  return (
    <section className="relative min-h-screen bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C9A962]/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-black/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/4" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-32 pb-16 md:pb-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#C9A962]/10 rounded-full mb-6 md:mb-8"
            >
              <span className="w-2 h-2 bg-[#C9A962] rounded-full animate-pulse" />
              <span className="text-xs md:text-sm font-medium text-[#8B7355]">
                Egypt&apos;s Premier Marketing Agency
              </span>
            </motion.div>

            {/* Headline */}
            {heroTitle ? (
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-black leading-[1.1] mb-6">
                {heroTitle}
              </h1>
            ) : (
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-black leading-[1.1] mb-6">
                We Build
                <span className="block text-[#C9A962]">Brands That</span>
                <span className="block">Drive Growth</span>
              </h1>
            )}

            {/* Description */}
            <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
              {heroSubtitle ??
                'Strategic branding and digital marketing solutions that transform businesses across Egypt and the MENA region.'}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <motion.button
                onClick={() => onNavigate('contact')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group px-8 py-4 bg-black text-white font-medium rounded-full flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
              >
                Start Your Project
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              <motion.button
                onClick={() => onNavigate('portfolio')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-white text-black font-medium rounded-full border border-gray-200 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
              >
                <Play className="w-5 h-5" />
                View Our Work
              </motion.button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-6 md:gap-10">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-black flex items-center justify-center">
                    <stat.icon className="w-5 h-5 md:w-6 md:h-6 text-[#C9A962]" />
                  </div>
                  <div className="text-left">
                    <div className="text-xl md:text-2xl font-bold">{stat.value}</div>
                    <div className="text-xs md:text-sm text-gray-500">{stat.label}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Content - Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="hidden lg:block relative"
          >
            <div className="relative">
              {/* Main Card */}
              <div className="relative bg-gradient-to-br from-gray-900 to-black rounded-3xl p-8 shadow-2xl">
                <div className="aspect-[4/3] flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 rounded-2xl bg-[#C9A962]/20 flex items-center justify-center mb-6">
                    <TrendingUp className="w-10 h-10 text-[#C9A962]" />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-2">300% Average ROI</h3>
                  <p className="text-gray-400">For our clients across all campaigns</p>
                </div>

                {/* Floating Cards */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="absolute -left-8 top-1/4 bg-white rounded-2xl shadow-xl p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">Revenue Growth</div>
                      <div className="text-xs text-gray-500">+250% this year</div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                  className="absolute -right-4 bottom-1/4 bg-white rounded-2xl shadow-xl p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">New Leads</div>
                      <div className="text-xs text-gray-500">1,200+ this month</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Client Logos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-16 md:mt-24 pt-8 md:pt-12 border-t border-gray-200"
        >
          <p className="text-center text-xs md:text-sm text-gray-400 mb-6 md:mb-8 uppercase tracking-wider">
            Trusted by leading brands
          </p>
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12 opacity-40">
            {['Nile Views', 'Cairo Eats', 'Alexandria Co.', 'TechStart', 'Green Nile'].map((client) => (
              <span key={client} className="text-base md:text-lg font-semibold text-gray-600">
                {client}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
