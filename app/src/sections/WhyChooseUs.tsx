import { CheckCircle2, Lightbulb, Users, Zap, BarChart3, Headphones } from 'lucide-react';
import { motion } from 'framer-motion';

export function WhyChooseUs() {
  const reasons = [
    {
      icon: Lightbulb,
      title: 'Strategic Approach',
      description: 'We dont just execute tactics—we develop comprehensive strategies aligned with your business goals and target audience.',
    },
    {
      icon: Users,
      title: 'Expert Team',
      description: 'Our team consists of seasoned marketers, creative designers, and data analysts with years of industry experience.',
    },
    {
      icon: Zap,
      title: 'Results-Driven',
      description: 'We focus on metrics that matter. Every campaign is designed to deliver measurable ROI and business growth.',
    },
    {
      icon: BarChart3,
      title: 'Data-Backed Decisions',
      description: 'We use advanced analytics and insights to inform our strategies and continuously optimize performance.',
    },
    {
      icon: Headphones,
      title: 'Dedicated Support',
      description: 'Youll have a dedicated account manager and direct access to our team for seamless communication.',
    },
    {
      icon: CheckCircle2,
      title: 'Proven Track Record',
      description: 'Weve helped 80+ businesses achieve their marketing goals with an average client satisfaction rate of 98%.',
    },
  ];

  return (
    <section className="section-padding bg-[var(--amd-gray-50)]">
      <div className="container-amd">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-2 bg-[var(--amd-gold)]/10 rounded-full text-sm font-medium text-[var(--amd-gold-dark)] mb-4">
              Why Choose Us
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--amd-black)] mb-6">
              The AMT Solutions Difference
            </h2>
            <p className="text-lg text-[var(--amd-gray-600)] mb-8 leading-relaxed">
              Were not just another marketing agency. Were your strategic partners committed to understanding your business, your audience, and your goals to deliver exceptional results.
            </p>

            {/* Feature List */}
            <div className="space-y-4">
              {[
                'Tailored strategies for your unique needs',
                'Transparent reporting and communication',
                'Flexible engagement models',
                'Continuous optimization and improvement',
              ].map((item, index) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-[var(--amd-gold)] flex-shrink-0" />
                  <span className="text-[var(--amd-gray-700)]">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Content - Cards Grid */}
          <div className="grid sm:grid-cols-2 gap-6">
            {reasons.map((reason, index) => (
              <motion.div
                key={reason.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-lg bg-[var(--amd-black)] flex items-center justify-center mb-4">
                  <reason.icon className="w-6 h-6 text-[var(--amd-gold)]" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-[var(--amd-black)] mb-2">
                  {reason.title}
                </h3>
                <p className="text-sm text-[var(--amd-gray-600)] leading-relaxed">
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
