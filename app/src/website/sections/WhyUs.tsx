import { motion } from 'framer-motion';
import { CheckCircle2, Lightbulb, Users, Zap, BarChart3, Headphones } from 'lucide-react';

export function WhyUs() {
  const reasons = [
    {
      icon: Lightbulb,
      title: 'Strategic Approach',
      description: 'We develop comprehensive strategies aligned with your business goals and target audience.',
    },
    {
      icon: Users,
      title: 'Expert Team',
      description: 'Seasoned marketers, creative designers, and data analysts with years of experience.',
    },
    {
      icon: Zap,
      title: 'Results-Driven',
      description: 'Every campaign is designed to deliver measurable ROI and business growth.',
    },
    {
      icon: BarChart3,
      title: 'Data-Backed',
      description: 'Advanced analytics and insights inform our strategies and optimization.',
    },
    {
      icon: Headphones,
      title: 'Dedicated Support',
      description: 'Direct access to your account manager and our entire team.',
    },
    {
      icon: CheckCircle2,
      title: 'Proven Track Record',
      description: '98% client satisfaction rate with 80+ successful projects delivered.',
    },
  ];

  const benefits = [
    'Tailored strategies for your needs',
    'Transparent reporting',
    'Flexible engagement models',
    'Continuous optimization',
  ];

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:sticky lg:top-32"
          >
            <span className="inline-block px-4 py-2 bg-[#C9A962]/10 rounded-full text-xs md:text-sm font-medium text-[#8B7355] mb-4">
              Why Choose Us
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-6">
              The AMT
              <span className="text-[#C9A962]"> Difference</span>
            </h2>
            <p className="text-base md:text-lg text-gray-600 mb-8 leading-relaxed">
              We&apos;re not just another agency. We&apos;re your strategic partners committed to understanding your business and delivering exceptional results.
            </p>

            {/* Benefits List */}
            <div className="space-y-4">
              {benefits.map((item, index) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-[#C9A962]/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-[#C9A962]" />
                  </div>
                  <span className="text-gray-700">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Content - Cards Grid */}
          <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
            {reasons.map((reason, index) => (
              <motion.div
                key={reason.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gray-50 rounded-2xl p-5 md:p-6 hover:bg-black group transition-colors duration-300"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-black group-hover:bg-[#C9A962] flex items-center justify-center mb-4 transition-colors">
                  <reason.icon className="w-5 h-5 md:w-6 md:h-6 text-[#C9A962] group-hover:text-black transition-colors" />
                </div>
                <h3 className="text-base md:text-lg font-bold text-black group-hover:text-white mb-2 transition-colors">
                  {reason.title}
                </h3>
                <p className="text-sm text-gray-600 group-hover:text-gray-300 transition-colors">
                  {reason.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
