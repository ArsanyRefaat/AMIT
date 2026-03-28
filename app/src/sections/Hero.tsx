import { ArrowRight, Play, TrendingUp, Users, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

type Page = 'home' | 'about' | 'services' | 'portfolio' | 'contact' | 'proposal' | 'case-study';

interface HeroProps {
  onNavigate: (page: Page) => void;
}

export function Hero({ onNavigate }: HeroProps) {
  const stats = [
    { icon: TrendingUp, value: '150+', label: 'Projects Delivered' },
    { icon: Users, value: '80+', label: 'Happy Clients' },
    { icon: Award, value: '12', label: 'Industry Awards' },
  ];

  return (
    <section className="relative min-h-screen flex items-center bg-gradient-to-br from-[var(--amd-gray-50)] to-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 right-20 w-96 h-96 bg-[var(--amd-gold)]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-[var(--amd-black)]/5 rounded-full blur-3xl" />
      </div>

      <div className="container-amd relative z-10 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--amd-gold)]/10 rounded-full mb-6">
              <span className="w-2 h-2 bg-[var(--amd-gold)] rounded-full animate-pulse" />
              <span className="text-sm font-medium text-[var(--amd-gold-dark)]">
                Egypt&apos;s Premier Marketing Agency
              </span>
            </div>

            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-[var(--amd-black)] leading-tight mb-6">
              We Build
              <span className="block text-[var(--amd-gold)]">Brands That</span>
              <span className="block">Drive Growth</span>
            </h1>

            <p className="text-lg text-[var(--amd-gray-600)] leading-relaxed mb-8 max-w-xl">
              AMT Solutions is a full-service marketing agency helping businesses in Egypt and the MENA region achieve extraordinary results through strategic branding, digital marketing, and creative excellence.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button
                onClick={() => onNavigate('proposal')}
                size="lg"
                className="bg-[var(--amd-black)] text-white hover:bg-[var(--amd-charcoal)] px-8 py-6 text-base"
              >
                Get Free Proposal
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                onClick={() => onNavigate('portfolio')}
                size="lg"
                variant="outline"
                className="border-[var(--amd-gray-300)] text-[var(--amd-gray-900)] hover:bg-[var(--amd-gray-50)] px-8 py-6 text-base"
              >
                <Play className="mr-2 w-5 h-5" />
                View Our Work
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-12 h-12 rounded-lg bg-[var(--amd-black)] flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-[var(--amd-gold)]" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[var(--amd-black)]">{stat.value}</div>
                    <div className="text-sm text-[var(--amd-gray-500)]">{stat.label}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Content - Hero Image/Graphic */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            className="relative hidden lg:block"
          >
            <div className="relative">
              {/* Main Image Placeholder */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <div className="aspect-[4/3] bg-gradient-to-br from-[var(--amd-charcoal)] to-[var(--amd-black)] flex items-center justify-center">
                  <div className="text-center p-12">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[var(--amd-gold)]/20 flex items-center justify-center">
                      <TrendingUp className="w-12 h-12 text-[var(--amd-gold)]" />
                    </div>
                    <h3 className="font-heading text-3xl font-bold text-white mb-2">
                      Results That Matter
                    </h3>
                    <p className="text-[var(--amd-gray-400)]">
                      Average 300% ROI for our clients
                    </p>
                  </div>
                </div>
              </div>

              {/* Floating Cards */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="absolute -left-8 top-1/4 bg-white rounded-xl shadow-xl p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[var(--amd-black)]">Revenue Growth</div>
                    <div className="text-xs text-[var(--amd-gray-500)]">+250% this year</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="absolute -right-4 bottom-1/4 bg-white rounded-xl shadow-xl p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[var(--amd-black)]">New Leads</div>
                    <div className="text-xs text-[var(--amd-gray-500)]">1,200+ this month</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Client Logos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-20 pt-12 border-t border-[var(--amd-gray-200)]"
        >
          <p className="text-center text-sm text-[var(--amd-gray-500)] mb-8">
            Trusted by leading brands across Egypt and the MENA region
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-16 opacity-50">
            {['Nile Views', 'Cairo Eats', 'Alexandria Jewellers', 'TechStart', 'Green Nile', 'Medical Plus'].map(
              (client) => (
                <div
                  key={client}
                  className="text-xl font-heading font-semibold text-[var(--amd-gray-400)]"
                >
                  {client}
                </div>
              )
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
