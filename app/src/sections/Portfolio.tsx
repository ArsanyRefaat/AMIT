import { useState } from 'react';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { portfolioItems } from '@/data/mockData';

type Page = 'home' | 'about' | 'services' | 'portfolio' | 'contact' | 'proposal' | 'case-study';

interface PortfolioProps {
  onNavigate: (page: Page, params?: { caseStudy?: string }) => void;
  fullPage?: boolean;
}

export function Portfolio({ onNavigate, fullPage = false }: PortfolioProps) {
  const [activeFilter, setActiveFilter] = useState('All');

  const categories = ['All', ...Array.from(new Set(portfolioItems.map((item) => item.category)))];

  const filteredItems =
    activeFilter === 'All'
      ? portfolioItems
      : portfolioItems.filter((item) => item.category === activeFilter);

  const displayedItems = fullPage ? filteredItems : portfolioItems.filter((item) => item.isFeatured);

  return (
    <section className={`${fullPage ? 'pt-32 pb-20' : 'section-padding'} bg-white`}>
      <div className="container-amd">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="inline-block px-4 py-2 bg-[var(--amd-gold)]/10 rounded-full text-sm font-medium text-[var(--amd-gold-dark)] mb-4">
            Our Portfolio
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--amd-black)] mb-6">
            Work That Speaks for Itself
          </h2>
          <p className="text-lg text-[var(--amd-gray-600)]">
            Explore our latest projects and see how weve helped businesses like yours achieve remarkable results.
          </p>
        </motion.div>

        {/* Filter Tabs */}
        {fullPage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-wrap justify-center gap-2 mb-12"
          >
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveFilter(category)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  activeFilter === category
                    ? 'bg-[var(--amd-black)] text-white'
                    : 'bg-[var(--amd-gray-100)] text-[var(--amd-gray-700)] hover:bg-[var(--amd-gray-200)]'
                }`}
              >
                {category}
              </button>
            ))}
          </motion.div>
        )}

        {/* Portfolio Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {displayedItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group cursor-pointer"
              onClick={() => onNavigate('case-study', { caseStudy: item.slug })}
            >
              <div className="relative overflow-hidden rounded-xl mb-4">
                {/* Image Placeholder */}
                <div className="aspect-[4/3] bg-gradient-to-br from-[var(--amd-gray-200)] to-[var(--amd-gray-300)] flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--amd-black)]/10 flex items-center justify-center">
                      <ExternalLink className="w-8 h-8 text-[var(--amd-gray-500)]" />
                    </div>
                    <span className="text-sm text-[var(--amd-gray-500)]">{item.category}</span>
                  </div>
                </div>
                {/* Overlay */}
                <div className="absolute inset-0 bg-[var(--amd-black)]/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-[var(--amd-black)]"
                  >
                    View Case Study
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div>
                <span className="text-xs font-medium text-[var(--amd-gold)] uppercase tracking-wider">
                  {item.category}
                </span>
                <h3 className="font-heading text-xl font-semibold text-[var(--amd-black)] mt-1 mb-2 group-hover:text-[var(--amd-gold)] transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-[var(--amd-gray-600)] line-clamp-2">
                  {item.shortDescription}
                </p>
              </div>
            </motion.div>
          ))}
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
              onClick={() => onNavigate('portfolio')}
              variant="outline"
              className="border-[var(--amd-gray-300)] text-[var(--amd-gray-900)] hover:bg-[var(--amd-gray-50)] px-8"
            >
              View All Projects
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
