import { ArrowRight, Phone, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

type Page = 'home' | 'about' | 'services' | 'portfolio' | 'contact' | 'proposal' | 'case-study';

interface CTASectionProps {
  onNavigate: (page: Page) => void;
}

export function CTASection({ onNavigate }: CTASectionProps) {
  return (
    <section className="py-20 lg:py-28 bg-gradient-to-br from-[var(--amd-black)] to-[var(--amd-charcoal)]">
      <div className="container-amd">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Grow Your Business?
            </h2>
            <p className="text-lg text-[var(--amd-gray-400)] mb-8 leading-relaxed">
              Lets discuss how AMT Solutions can help you achieve your marketing goals. Get a free consultation and custom proposal tailored to your business needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => onNavigate('proposal')}
                size="lg"
                className="bg-[var(--amd-gold)] text-[var(--amd-black)] hover:bg-[var(--amd-gold-light)] px-8"
              >
                Get Free Proposal
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                onClick={() => onNavigate('contact')}
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 px-8"
              >
                <Calendar className="mr-2 w-5 h-5" />
                Book a Call
              </Button>
            </div>
          </motion.div>

          {/* Right Content - Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:pl-12"
          >
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <h3 className="font-heading text-xl font-semibold text-white mb-6">
                Get in Touch
              </h3>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[var(--amd-gold)]/20 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-[var(--amd-gold)]" />
                  </div>
                  <div>
                    <div className="text-sm text-[var(--amd-gray-400)]">Call Us</div>
                    <a
                      href="tel:+201001234567"
                      className="text-white hover:text-[var(--amd-gold)] transition-colors"
                    >
                      +20 100 123 4567
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[var(--amd-gold)]/20 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-[var(--amd-gold)]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm text-[var(--amd-gray-400)]">Email Us</div>
                    <a
                      href="mailto:hello@amdsolutions.com"
                      className="text-white hover:text-[var(--amd-gold)] transition-colors"
                    >
                      hello@amdsolutions.com
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[var(--amd-gold)]/20 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-[var(--amd-gold)]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm text-[var(--amd-gray-400)]">Visit Us</div>
                    <span className="text-white">
                      123 Nile Corniche, Cairo, Egypt
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
