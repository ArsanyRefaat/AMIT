import { Target, Eye, Award, Users, TrendingUp, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { teamMembers } from '@/data/mockData';

type Page = 'home' | 'about' | 'services' | 'portfolio' | 'contact' | 'proposal' | 'case-study';

interface AboutProps {
  onNavigate: (page: Page) => void;
}

export function About({ }: AboutProps) {
  const values = [
    {
      icon: Target,
      title: 'Results First',
      description: 'We measure success by the tangible results we deliver for our clients.',
    },
    {
      icon: Users,
      title: 'Client Partnership',
      description: 'We view every client relationship as a true partnership, invested in your success.',
    },
    {
      icon: TrendingUp,
      title: 'Continuous Growth',
      description: 'Were constantly learning, evolving, and pushing boundaries to stay ahead.',
    },
    {
      icon: Heart,
      title: 'Passion & Integrity',
      description: 'We love what we do and operate with honesty, transparency, and respect.',
    },
  ];

  return (
    <div className="pt-32 pb-20">
      {/* Hero Section */}
      <section className="mb-20">
        <div className="container-amd">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-4 py-2 bg-[var(--amd-gold)]/10 rounded-full text-sm font-medium text-[var(--amd-gold-dark)] mb-4">
                About Us
              </span>
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--amd-black)] mb-6">
                Were on a Mission to Transform Brands
              </h1>
              <p className="text-lg text-[var(--amd-gray-600)] leading-relaxed mb-6">
                Founded in 2010, AMT Solutions has grown from a small design studio to one of Egypts leading full-service marketing agencies. Weve helped over 80 businesses across various industries achieve remarkable growth through strategic marketing and creative excellence.
              </p>
              <p className="text-lg text-[var(--amd-gray-600)] leading-relaxed">
                Our team of strategists, creatives, and digital experts work together to deliver integrated marketing solutions that drive real business results. We believe in building long-term partnerships with our clients, becoming an extension of their team.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-[var(--amd-charcoal)] to-[var(--amd-black)] flex items-center justify-center">
                <div className="text-center p-12">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[var(--amd-gold)]/20 flex items-center justify-center">
                    <Award className="w-12 h-12 text-[var(--amd-gold)]" />
                  </div>
                  <h3 className="font-heading text-3xl font-bold text-white mb-2">
                    15+ Years
                  </h3>
                  <p className="text-[var(--amd-gray-400)]">
                    of Marketing Excellence
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section-padding bg-[var(--amd-gray-50)]">
        <div className="container-amd">
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl p-8 lg:p-12"
            >
              <div className="w-14 h-14 rounded-xl bg-[var(--amd-black)] flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-[var(--amd-gold)]" />
              </div>
              <h2 className="font-heading text-2xl lg:text-3xl font-bold text-[var(--amd-black)] mb-4">
                Our Mission
              </h2>
              <p className="text-[var(--amd-gray-600)] leading-relaxed">
                To empower businesses in Egypt and the MENA region with world-class marketing solutions that drive growth, build brands, and create lasting impact. We strive to be the trusted partner that helps our clients navigate the ever-evolving digital landscape.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-2xl p-8 lg:p-12"
            >
              <div className="w-14 h-14 rounded-xl bg-[var(--amd-black)] flex items-center justify-center mb-6">
                <Eye className="w-7 h-7 text-[var(--amd-gold)]" />
              </div>
              <h2 className="font-heading text-2xl lg:text-3xl font-bold text-[var(--amd-black)] mb-4">
                Our Vision
              </h2>
              <p className="text-[var(--amd-gray-600)] leading-relaxed">
                To be the regions most respected marketing agency, known for our strategic thinking, creative excellence, and unwavering commitment to client success. We envision a future where every business, regardless of size, has access to premium marketing expertise.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding">
        <div className="container-amd">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className="inline-block px-4 py-2 bg-[var(--amd-gold)]/10 rounded-full text-sm font-medium text-[var(--amd-gold-dark)] mb-4">
              Our Values
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--amd-black)] mb-6">
              What We Stand For
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center p-6"
              >
                <div className="w-16 h-16 rounded-xl bg-[var(--amd-black)] flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-[var(--amd-gold)]" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-[var(--amd-black)] mb-2">
                  {value.title}
                </h3>
                <p className="text-sm text-[var(--amd-gray-600)]">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section-padding bg-[var(--amd-gray-50)]">
        <div className="container-amd">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className="inline-block px-4 py-2 bg-[var(--amd-gold)]/10 rounded-full text-sm font-medium text-[var(--amd-gold-dark)] mb-4">
              Our Team
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--amd-black)] mb-6">
              Meet the Experts
            </h2>
            <p className="text-lg text-[var(--amd-gray-600)]">
              Our team of passionate marketers, creatives, and strategists are dedicated to your success.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-32 h-32 rounded-full bg-[var(--amd-black)] flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl font-heading font-bold text-[var(--amd-gold)]">
                    {member.name.charAt(0)}
                  </span>
                </div>
                <h3 className="font-heading text-xl font-semibold text-[var(--amd-black)] mb-1">
                  {member.name}
                </h3>
                <p className="text-[var(--amd-gold)] text-sm font-medium mb-3">
                  {member.position}
                </p>
                <p className="text-sm text-[var(--amd-gray-600)]">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
