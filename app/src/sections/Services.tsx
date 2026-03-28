import { Palette, Share2, TrendingUp, FileText, Globe, Search, Settings, Target, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { services } from '@/data/mockData';

type Page = 'home' | 'about' | 'services' | 'portfolio' | 'contact' | 'proposal' | 'case-study';

interface ServicesProps {
  onNavigate: (page: Page) => void;
  fullPage?: boolean;
}

const iconMap: Record<string, React.ElementType> = {
  Palette,
  Share2,
  TrendingUp,
  FileText,
  Globe,
  Search,
  Settings,
  Target,
};

export function Services({ onNavigate, fullPage = false }: ServicesProps) {
  const displayedServices = fullPage ? services : services.slice(0, 6);

  return (
    <section className={`${fullPage ? 'pt-32 pb-20' : 'section-padding'} bg-white`}>
      <div className="container-amd">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-2 bg-[var(--amd-gold)]/10 rounded-full text-sm font-medium text-[var(--amd-gold-dark)] mb-4">
            Our Services
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--amd-black)] mb-6">
            Full-Service Marketing Solutions
          </h2>
          <p className="text-lg text-[var(--amd-gray-600)]">
            From brand strategy to digital execution, we offer comprehensive marketing services designed to drive growth and deliver measurable results.
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {displayedServices.map((service, index) => {
            const Icon = iconMap[service.icon] || Palette;
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group card-amd-hover p-8 cursor-pointer"
                onClick={() => onNavigate('proposal')}
              >
                <div className="w-14 h-14 rounded-xl bg-[var(--amd-black)] flex items-center justify-center mb-6 group-hover:bg-[var(--amd-gold)] transition-colors">
                  <Icon className="w-7 h-7 text-[var(--amd-gold)] group-hover:text-[var(--amd-black)] transition-colors" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-[var(--amd-black)] mb-3">
                  {service.title}
                </h3>
                <p className="text-[var(--amd-gray-600)] text-sm leading-relaxed mb-4">
                  {service.shortDescription}
                </p>
                <div className="flex items-center text-sm font-medium text-[var(--amd-black)] group-hover:text-[var(--amd-gold)] transition-colors">
                  Learn More
                  <ArrowRight className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        {!fullPage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center mt-12"
          >
            <Button
              onClick={() => onNavigate('services')}
              variant="outline"
              className="border-[var(--amd-gray-300)] text-[var(--amd-gray-900)] hover:bg-[var(--amd-gray-50)] px-8"
            >
              View All Services
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
