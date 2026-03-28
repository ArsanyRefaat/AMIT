import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Phone, Mail, MapPin } from 'lucide-react';
import { API_BASE } from '@/lib/api';

type Page = 'home' | 'about' | 'services' | 'portfolio' | 'contact' | 'case-study';

interface CTAProps {
  onNavigate: (page: Page) => void;
}

type CompanySettings = {
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
};

export function CTA({ onNavigate }: CTAProps) {
  const [company, setCompany] = useState<CompanySettings | null>(null);

  useEffect(() => {
    const loadCompany = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/settings/company`);
        if (!res.ok) return;
        const data = await res.json();
        setCompany({
          email: data.email ?? '',
          phone: data.phone ?? '',
          address: data.address ?? '',
          city: data.city ?? '',
          country: data.country ?? '',
        });
      } catch {
        // ignore, fall back to hardcoded defaults below
      }
    };
    loadCompany();
  }, []);

  return (
    <section className="py-16 md:py-24 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6">
              Ready to Grow Your Business?
            </h2>
            <p className="text-base md:text-lg text-gray-400 mb-6 md:mb-8 leading-relaxed">
              Let&apos;s discuss how AMT Solutions can help you achieve your marketing goals. Get a free consultation and custom proposal.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              <motion.button
                onClick={() => onNavigate('contact')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group px-6 md:px-8 py-3.5 md:py-4 bg-[#C9A962] text-black font-medium rounded-full flex items-center justify-center gap-2 hover:bg-[#d4b76d] transition-colors"
              >
                Get Free Proposal
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              <motion.button
                onClick={() => onNavigate('contact')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 md:px-8 py-3.5 md:py-4 bg-transparent text-white font-medium rounded-full border border-white/30 flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                Book a Call
              </motion.button>
            </div>
          </motion.div>

          {/* Right Content - Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl md:rounded-3xl p-6 md:p-8 border border-white/10">
              <h3 className="text-lg md:text-xl font-bold text-white mb-5 md:mb-6">
                Get in Touch
              </h3>
              <div className="space-y-4 md:space-y-5">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[#C9A962]/20 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-[#C9A962]" />
                  </div>
                  <div>
                    <div className="text-xs md:text-sm text-gray-400">Call Us</div>
                    <a
                      href={`tel:${(company?.phone || '+201001234567').replace(/\s+/g, '')}`}
                      className="text-white hover:text-[#C9A962] transition-colors text-sm md:text-base"
                    >
                      {company?.phone || '+20 100 123 4567'}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[#C9A962]/20 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-[#C9A962]" />
                  </div>
                  <div>
                    <div className="text-xs md:text-sm text-gray-400">Email Us</div>
                    <a
                      href={`mailto:${company?.email || 'hello@amtsolutions.com'}`}
                      className="text-white hover:text-[#C9A962] transition-colors text-sm md:text-base"
                    >
                      {company?.email || 'hello@amtsolutions.com'}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[#C9A962]/20 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-[#C9A962]" />
                  </div>
                  <div>
                    <div className="text-xs md:text-sm text-gray-400">Visit Us</div>
                    <span className="text-white text-sm md:text-base">
                      {company
                        ? `${company.address}${company.city ? `, ${company.city}` : ''}${
                            company.country ? `, ${company.country}` : ''
                          }`
                        : '123 Nile Corniche, Cairo'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
