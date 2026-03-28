import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { portfolioItems } from '@/data/mockData';
import type { PortfolioItem } from '@/types';
import { API_BASE } from '@/lib/api';

type Page = 'home' | 'about' | 'services' | 'portfolio' | 'contact' | 'case-study';

interface PortfolioProps {
  onNavigate: (page: Page, params?: { caseStudy?: string }) => void;
  fullPage?: boolean;
}

type PublicPortfolioApi = {
  id: number;
  slug: string;
  title: string;
  category: string;
  clientName: string;
  shortDescription: string;
  imageUrl?: string | null;
  results: { metric: string; value: string }[];
};

function mapApiToPortfolioItem(x: PublicPortfolioApi): PortfolioItem {
  const url = x.imageUrl?.trim() ?? '';
  return {
    id: `crm-${x.id}`,
    slug: x.slug,
    title: x.title,
    category: x.category,
    client: x.clientName,
    shortDescription: x.shortDescription,
    problem: '',
    solution: '',
    deliverables: [],
    results: x.results.map((r) => ({ metric: r.metric, value: r.value })),
    images: url ? [url] : [],
    featuredImage: url,
    date: new Date().toISOString().slice(0, 10),
    isFeatured: true,
    isActive: true,
  };
}

export function Portfolio({ onNavigate, fullPage = false }: PortfolioProps) {
  const [activeFilter, setActiveFilter] = useState('All');
  const [apiItems, setApiItems] = useState<PortfolioItem[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE}/api/public/portfolio`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : []))
      .then((data: PublicPortfolioApi[]) => {
        if (cancelled || !Array.isArray(data) || data.length === 0) return;
        setApiItems(data.map(mapApiToPortfolioItem));
      })
      .catch(() => {
        /* keep mock fallback */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const sourceItems = apiItems ?? portfolioItems;
  const categories = ['All', ...Array.from(new Set(sourceItems.map((item) => item.category)))];
  const featuredItems = sourceItems.filter((item) => item.isFeatured);
  const displayedItems = fullPage
    ? activeFilter === 'All'
      ? sourceItems
      : sourceItems.filter((item) => item.category === activeFilter)
    : featuredItems;

  return (
    <section className={`${fullPage ? 'pt-24 md:pt-32 pb-16' : 'py-16 md:py-24'} bg-gray-50`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-10 md:mb-14"
        >
          <span className="inline-block px-4 py-2 bg-[#C9A962]/10 rounded-full text-xs md:text-sm font-medium text-[#8B7355] mb-4">
            Our Work
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-4">
            Featured Projects
          </h2>
          <p className="text-base md:text-lg text-gray-600">
            Discover how we&apos;ve helped brands achieve remarkable growth.
          </p>
        </motion.div>

        {/* Filter Tabs (Full Page Only) */}
        {fullPage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-wrap justify-center gap-2 mb-10 md:mb-12"
          >
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveFilter(category)}
                className={`px-4 md:px-5 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-medium transition-all ${
                  activeFilter === category
                    ? 'bg-black text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </motion.div>
        )}

        {/* Portfolio Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <AnimatePresence mode="wait">
            {displayedItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="group cursor-pointer"
                onClick={() => onNavigate('case-study', { caseStudy: item.slug })}
              >
                <div className="relative overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-xl transition-shadow">
                  {/* Image or placeholder */}
                  <div className="aspect-[4/3] bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center relative overflow-hidden">
                    {item.featuredImage?.trim() ? (
                      <img
                        src={item.featuredImage.trim()}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : null}
                    <div
                      className={`text-center p-6 md:p-8 relative z-[1] ${
                        item.featuredImage?.trim() ? 'opacity-0 pointer-events-none' : ''
                      }`}
                    >
                      <div className="w-14 h-14 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 rounded-full bg-white/80 flex items-center justify-center">
                        <ExternalLink className="w-6 h-6 md:w-7 md:h-7 text-gray-500" />
                      </div>
                      <span className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">
                        {item.category}
                      </span>
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-[2]">
                      <button className="px-5 py-2.5 md:px-6 md:py-3 bg-white text-black text-sm font-medium rounded-full flex items-center gap-2 hover:bg-[#C9A962] transition-colors">
                        View Case Study
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 md:p-6">
                    <span className="text-xs font-medium text-[#C9A962] uppercase tracking-wider">
                      {item.category}
                    </span>
                    <h3 className="text-lg md:text-xl font-bold text-black mt-1 mb-2 group-hover:text-[#C9A962] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {item.shortDescription}
                    </p>

                    {/* Results Preview */}
                    {item.results.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100 flex gap-4">
                        {item.results.slice(0, 2).map((result) => (
                          <div key={result.metric}>
                            <div className="text-lg md:text-xl font-bold text-black">{result.value}</div>
                            <div className="text-xs text-gray-500">{result.metric}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Bottom CTA */}
        {!fullPage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center mt-10 md:mt-12"
          >
            <button
              onClick={() => onNavigate('portfolio')}
              className="inline-flex items-center gap-2 px-6 py-3 border border-gray-200 rounded-full text-sm font-medium text-black hover:bg-gray-50 transition-colors"
            >
              View All Projects
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
