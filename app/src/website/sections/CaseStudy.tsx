import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { portfolioItems } from '@/data/mockData';
import type { PortfolioItem } from '@/types';
import { API_BASE } from '@/lib/api';

type Page = 'home' | 'about' | 'services' | 'portfolio' | 'contact' | 'case-study';

interface CaseStudyProps {
  slug: string;
  onNavigate: (page: Page) => void;
}

type ApiPortfolioDetail = {
  title: string;
  category: string;
  clientName: string;
  shortDescription: string;
  fullDescription: string | null;
  imageUrl?: string | null;
  results: { metric: string; value: string }[];
  dateLabel: string;
};

function toViewFromMock(cs: PortfolioItem) {
  return {
    category: cs.category,
    title: cs.title,
    shortDescription: cs.shortDescription,
    client: cs.client,
    dateLabel: new Date(cs.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    results: cs.results,
    problem: cs.problem,
    solution: cs.solution,
    deliverables: cs.deliverables,
    heroImageUrl: cs.featuredImage?.trim() || undefined,
  };
}

function toViewFromApi(d: ApiPortfolioDetail) {
  const body = d.fullDescription?.trim() ?? '';
  const deliverables =
    body.length > 0
      ? body
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter(Boolean)
          .slice(0, 9)
      : ['Discovery & planning', 'Execution & delivery', 'Review & iteration'];
  return {
    category: d.category,
    title: d.title,
    shortDescription: d.shortDescription,
    client: d.clientName,
    dateLabel: d.dateLabel,
    results: d.results,
    problem:
      body.length > 0
        ? body.split(/\r?\n\r?\n/)[0] ?? d.shortDescription
        : d.shortDescription,
    solution: body.length > 0 ? body : d.shortDescription,
    deliverables: deliverables.length > 0 ? deliverables : [d.shortDescription],
    heroImageUrl: d.imageUrl?.trim() || undefined,
  };
}

export function CaseStudy({ slug, onNavigate }: CaseStudyProps) {
  const [apiDetail, setApiDetail] = useState<ApiPortfolioDetail | null | undefined>(undefined);
  const isCrmSlug = /^project-\d+$/i.test(slug);

  useEffect(() => {
    if (!isCrmSlug) {
      setApiDetail(null);
      return;
    }
    let cancelled = false;
    fetch(`${API_BASE}/api/public/portfolio/${encodeURIComponent(slug)}`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: ApiPortfolioDetail | null) => {
        if (!cancelled) setApiDetail(data);
      })
      .catch(() => {
        if (!cancelled) setApiDetail(null);
      });
    return () => {
      cancelled = true;
    };
  }, [slug, isCrmSlug]);

  if (isCrmSlug && apiDetail === undefined) {
    return (
      <div className="pt-24 md:pt-32 pb-16 text-center text-gray-600">
        Loading…
      </div>
    );
  }

  if (isCrmSlug && apiDetail === null) {
    return (
      <div className="pt-24 md:pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl md:text-4xl font-bold text-black mb-4">Case Study Not Found</h1>
          <p className="text-gray-600 mb-6">This project is not available on the public site.</p>
          <button
            onClick={() => onNavigate('portfolio')}
            className="px-6 py-3 bg-black text-white rounded-full font-medium"
          >
            View All Projects
          </button>
        </div>
      </div>
    );
  }

  let view: ReturnType<typeof toViewFromMock> | null = null;

  if (isCrmSlug && apiDetail) {
    view = toViewFromApi(apiDetail);
  } else {
    const caseStudy = portfolioItems.find((item) => item.slug === slug);
    if (!caseStudy) {
      return (
        <div className="pt-24 md:pt-32 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-2xl md:text-4xl font-bold text-black mb-4">Case Study Not Found</h1>
            <p className="text-gray-600 mb-6">The case study you&apos;re looking for doesn&apos;t exist.</p>
            <button
              onClick={() => onNavigate('portfolio')}
              className="px-6 py-3 bg-black text-white rounded-full font-medium"
            >
              View All Projects
            </button>
          </div>
        </div>
      );
    }
    view = toViewFromMock(caseStudy);
  }

  const caseStudy = view;

  return (
    <div className="pt-16 md:pt-24 pb-16">
      <section className="bg-black text-white py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <button
              onClick={() => onNavigate('portfolio')}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-5 md:mb-6 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Portfolio
            </button>
            <span className="inline-block px-3 py-1 bg-[#C9A962]/20 rounded-full text-xs md:text-sm font-medium text-[#C9A962] mb-4">
              {caseStudy.category}
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">{caseStudy.title}</h1>
            <p className="text-base md:text-lg text-gray-400 max-w-3xl">{caseStudy.shortDescription}</p>
            <div className="flex flex-wrap items-center gap-4 md:gap-8 mt-6 md:mt-8">
              <div>
                <div className="text-xs md:text-sm text-gray-500">Client</div>
                <div className="font-semibold text-sm md:text-base">{caseStudy.client}</div>
              </div>
              <div>
                <div className="text-xs md:text-sm text-gray-500">Date</div>
                <div className="font-semibold text-sm md:text-base">{caseStudy.dateLabel}</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {caseStudy.heroImageUrl ? (
        <section className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
            <img
              src={caseStudy.heroImageUrl}
              alt=""
              className="w-full max-h-[min(70vh,520px)] rounded-xl object-cover shadow-sm"
              loading="eager"
              decoding="async"
            />
          </div>
        </section>
      ) : null}

      <section className="py-10 md:py-16 bg-[#C9A962]/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8 md:mb-10"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-black mb-2">Results Achieved</h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
            {caseStudy.results.map((result, index) => (
              <motion.div
                key={`${result.metric}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-5xl font-bold text-[#C9A962] mb-1 md:mb-2">{result.value}</div>
                <div className="text-sm md:text-base text-gray-600">{result.metric}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-xl md:text-2xl font-bold text-black mb-4">The Challenge</h2>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">{caseStudy.problem}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h2 className="text-xl md:text-2xl font-bold text-black mb-4">Our Solution</h2>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">{caseStudy.solution}</p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-10 md:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-xl md:text-2xl font-bold text-black mb-6 md:mb-8 text-center">What We Delivered</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 max-w-3xl mx-auto">
              {caseStudy.deliverables.map((deliverable, index) => (
                <motion.div
                  key={`${deliverable}-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex items-center gap-2 md:gap-3 bg-white rounded-xl p-3 md:p-4"
                >
                  <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-[#C9A962] flex-shrink-0" />
                  <span className="text-sm md:text-base text-gray-700">{deliverable}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-10 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-black rounded-2xl md:rounded-3xl p-6 md:p-12 text-center"
          >
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 md:mb-4">Ready for Similar Results?</h2>
            <p className="text-sm md:text-base text-gray-400 max-w-xl mx-auto mb-6 md:mb-8">
              Let&apos;s discuss how we can help your business achieve remarkable growth.
            </p>
            <button
              onClick={() => onNavigate('contact')}
              className="px-6 md:px-8 py-3 md:py-4 bg-[#C9A962] text-black font-medium rounded-full inline-flex items-center gap-2 hover:bg-[#d4b76d] transition-colors"
            >
              Get Your Proposal
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
