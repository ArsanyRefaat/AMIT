import { motion } from 'framer-motion';
import { Target, Eye, Award, TrendingUp, Heart, Users } from 'lucide-react';
import { teamMembers } from '@/data/mockData';

type Page = 'home' | 'about' | 'services' | 'portfolio' | 'contact' | 'case-study';

interface AboutProps {
  onNavigate: (page: Page) => void;
}

export function About({ }: AboutProps) {
  const values = [
    {
      icon: Target,
      title: 'Results First',
      description: 'We measure success by the tangible results we deliver.',
    },
    {
      icon: Users,
      title: 'True Partnership',
      description: 'We view every client relationship as a genuine partnership.',
    },
    {
      icon: TrendingUp,
      title: 'Continuous Growth',
      description: 'Were constantly learning and pushing boundaries.',
    },
    {
      icon: Heart,
      title: 'Passion & Integrity',
      description: 'We operate with honesty, transparency, and respect.',
    },
  ];

  return (
    <div className="pt-20 md:pt-28 pb-16">
      {/* Hero Section */}
      <section className="mb-16 md:mb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-4 py-2 bg-[#C9A962]/10 rounded-full text-xs md:text-sm font-medium text-[#8B7355] mb-4">
                About Us
              </span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-5 md:mb-6">
                Transforming Brands Across the MENA Region
              </h1>
              <p className="text-base md:text-lg text-gray-600 mb-4 leading-relaxed">
                Founded in 2010, AMT Solutions has grown from a small design studio to one of Egypt&apos;s leading full-service marketing agencies.
              </p>
              <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                We&apos;ve helped over 80 businesses achieve remarkable growth through strategic marketing and creative excellence.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="aspect-square rounded-2xl md:rounded-3xl bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
                <div className="text-center p-8 md:p-12">
                  <div className="w-16 h-16 md:w-24 md:h-24 mx-auto mb-4 md:mb-6 rounded-full bg-[#C9A962]/20 flex items-center justify-center">
                    <Award className="w-8 h-8 md:w-12 md:h-12 text-[#C9A962]" />
                  </div>
                  <div className="text-4xl md:text-6xl font-bold text-white mb-1 md:mb-2">15+</div>
                  <div className="text-gray-400 text-sm md:text-base">Years of Excellence</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 md:py-24 bg-gray-50 mb-16 md:mb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-10"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-black flex items-center justify-center mb-5 md:mb-6">
                <Target className="w-6 h-6 md:w-7 md:h-7 text-[#C9A962]" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-black mb-3 md:mb-4">
                Our Mission
              </h2>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                To empower businesses in Egypt and the MENA region with world-class marketing solutions that drive growth, build brands, and create lasting impact.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-10"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-black flex items-center justify-center mb-5 md:mb-6">
                <Eye className="w-6 h-6 md:w-7 md:h-7 text-[#C9A962]" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-black mb-3 md:mb-4">
                Our Vision
              </h2>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                To be the region&apos;s most respected marketing agency, known for strategic thinking, creative excellence, and unwavering commitment to client success.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="mb-16 md:mb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-2xl mx-auto mb-10 md:mb-14"
          >
            <span className="inline-block px-4 py-2 bg-[#C9A962]/10 rounded-full text-xs md:text-sm font-medium text-[#8B7355] mb-4">
              Our Values
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
              What We Stand For
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center p-5 md:p-6 bg-gray-50 rounded-2xl"
              >
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-black flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-6 h-6 md:w-7 md:h-7 text-[#C9A962]" />
                </div>
                <h3 className="text-base md:text-lg font-bold text-black mb-2">
                  {value.title}
                </h3>
                <p className="text-sm text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-2xl mx-auto mb-10 md:mb-14"
          >
            <span className="inline-block px-4 py-2 bg-[#C9A962]/10 rounded-full text-xs md:text-sm font-medium text-[#8B7355] mb-4">
              Our Team
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
              Meet the Experts
            </h2>
            <p className="text-base md:text-lg text-gray-600">
              Our team of passionate marketers, creatives, and strategists are dedicated to your success.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-black flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl md:text-3xl font-bold text-[#C9A962]">
                    {member.name.charAt(0)}
                  </span>
                </div>
                <h3 className="text-base md:text-lg font-bold text-black mb-1">
                  {member.name}
                </h3>
                <p className="text-xs md:text-sm text-[#C9A962] font-medium mb-2">
                  {member.position}
                </p>
                <p className="text-sm text-gray-600">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
