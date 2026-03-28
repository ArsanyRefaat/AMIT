import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Palette,
  Share2,
  TrendingUp,
  FileText,
  Globe,
  Search,
  Settings,
  Target,
  ArrowRight,
} from 'lucide-react';
import { API_BASE } from '@/lib/api';

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

interface ServicesProps {
  fullPage?: boolean;
}

export function Services({ fullPage = false }: ServicesProps) {
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/website-services`);
        if (!res.ok) throw new Error(`Failed to load website services (${res.status})`);
        const data = await res.json();
        const list: any[] = Array.isArray(data) ? data : [];

        setServices(
          list
            .filter((s: any) => s.isActive !== false)
            .sort((a: any, b: any) => a.order - b.order || a.title.localeCompare(b.title))
        );
      } catch (err) {
        console.error('Failed to load website services.', err);
        setServices([]);
      }
    };
    load();
  }, []);

  const displayedServices = fullPage ? services : services.slice(0, 6);

  return (
    <section className={`${fullPage ? 'pt-24 md:pt-32 pb-16' : 'py-16 md:py-24'} bg-white`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-12 md:mb-16"
        >
          <span className="inline-block px-4 py-2 bg-[#C9A962]/10 rounded-full text-xs md:text-sm font-medium text-[#8B7355] mb-4">
            Our Services
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-4">
            Full-Service Marketing
          </h2>
          <p className="text-base md:text-lg text-gray-600">
            End-to-end solutions designed to elevate your brand and drive measurable results.
          </p>
        </motion.div>

        {/* Services Grid */}
        {displayedServices.length === 0 ? (
          <p className="text-center text-gray-500">
            No services configured yet. Add services from the Website Management &rarr; Services tab in
            the CRM.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {displayedServices.map((service, index) => {
              const Icon = iconMap[service.icon] || Palette;
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group relative bg-gray-50 hover:bg-black rounded-2xl p-6 md:p-8 transition-all duration-300 cursor-pointer"
                >
                  {/* Icon */}
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-black group-hover:bg-[#C9A962] flex items-center justify-center mb-5 transition-colors">
                    <Icon className="w-6 h-6 md:w-7 md:h-7 text-[#C9A962] group-hover:text-black transition-colors" />
                  </div>

                  {/* Content */}
                  <h3 className="text-lg md:text-xl font-bold text-black group-hover:text-white mb-2 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-sm md:text-base text-gray-600 group-hover:text-gray-300 mb-4 transition-colors line-clamp-2">
                    {service.shortDescription}
                  </p>

                  {/* Link */}
                  <div className="flex items-center gap-2 text-sm font-medium text-black group-hover:text-[#C9A962] transition-colors">
                    Learn More
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>

                  {/* Hover Border */}
                  <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-[#C9A962]/30 transition-colors pointer-events-none" />
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Bottom CTA */}
        {!fullPage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center mt-10 md:mt-12"
          >
            <button className="inline-flex items-center gap-2 px-6 py-3 border border-gray-200 rounded-full text-sm font-medium text-black hover:bg-gray-50 transition-colors">
              View All Services
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
