import { ArrowLeft, TrendingUp, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { portfolioItems } from '@/data/mockData';

type Page = 'home' | 'about' | 'services' | 'portfolio' | 'contact' | 'proposal' | 'case-study';

interface CaseStudyProps {
  slug: string;
  onNavigate: (page: Page) => void;
}

export function CaseStudy({ slug, onNavigate }: CaseStudyProps) {
  const caseStudy = portfolioItems.find((item) => item.slug === slug);

  if (!caseStudy) {
    return (
      <div className="pt-32 pb-20">
        <div className="container-amd text-center">
          <h1 className="font-heading text-4xl font-bold text-[var(--amd-black)] mb-4">
            Case Study Not Found
          </h1>
          <p className="text-[var(--amd-gray-600)] mb-6">
            The case study youre looking for doesnt exist.
          </p>
          <Button
            onClick={() => onNavigate('portfolio')}
            className="bg-[var(--amd-black)] text-white"
          >
            View All Projects
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20">
      {/* Hero */}
      <section className="bg-[var(--amd-black)] text-white py-20">
        <div className="container-amd">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <button
              onClick={() => onNavigate('portfolio')}
              className="flex items-center gap-2 text-[var(--amd-gray-400)] hover:text-white transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Portfolio
            </button>
            <span className="inline-block px-4 py-2 bg-[var(--amd-gold)]/20 rounded-full text-sm font-medium text-[var(--amd-gold)] mb-4">
              {caseStudy.category}
            </span>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              {caseStudy.title}
            </h1>
            <p className="text-xl text-[var(--amd-gray-400)] max-w-3xl">
              {caseStudy.shortDescription}
            </p>
            <div className="flex items-center gap-8 mt-8">
              <div>
                <div className="text-sm text-[var(--amd-gray-500)]">Client</div>
                <div className="font-semibold">{caseStudy.client}</div>
              </div>
              <div>
                <div className="text-sm text-[var(--amd-gray-500)]">Date</div>
                <div className="font-semibold">
                  {new Date(caseStudy.date).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Image */}
      <section className="py-12">
        <div className="container-amd">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="aspect-video bg-gradient-to-br from-[var(--amd-gray-200)] to-[var(--amd-gray-300)] rounded-2xl flex items-center justify-center"
          >
            <div className="text-center p-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[var(--amd-black)]/10 flex items-center justify-center">
                <TrendingUp className="w-10 h-10 text-[var(--amd-gray-500)]" />
              </div>
              <span className="text-[var(--amd-gray-500)]">Project Preview</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Results */}
      <section className="py-12 bg-[var(--amd-gold)]/5">
        <div className="container-amd">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h2 className="font-heading text-3xl font-bold text-[var(--amd-black)] mb-4">
              Results Achieved
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {caseStudy.results.map((result, index) => (
              <motion.div
                key={result.metric}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="font-heading text-5xl lg:text-6xl font-bold text-[var(--amd-gold)] mb-2">
                  {result.value}
                </div>
                <div className="text-[var(--amd-gray-600)]">{result.metric}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem & Solution */}
      <section className="py-16">
        <div className="container-amd">
          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="font-heading text-2xl lg:text-3xl font-bold text-[var(--amd-black)] mb-6">
                The Challenge
              </h2>
              <p className="text-[var(--amd-gray-600)] leading-relaxed">
                {caseStudy.problem}
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h2 className="font-heading text-2xl lg:text-3xl font-bold text-[var(--amd-black)] mb-6">
                Our Solution
              </h2>
              <p className="text-[var(--amd-gray-600)] leading-relaxed">
                {caseStudy.solution}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Deliverables */}
      <section className="py-16 bg-[var(--amd-gray-50)]">
        <div className="container-amd">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-heading text-2xl lg:text-3xl font-bold text-[var(--amd-black)] mb-8 text-center">
              What We Delivered
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {caseStudy.deliverables.map((deliverable, index) => (
                <motion.div
                  key={deliverable}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex items-center gap-3 bg-white rounded-lg p-4"
                >
                  <CheckCircle2 className="w-5 h-5 text-[var(--amd-gold)] flex-shrink-0" />
                  <span className="text-[var(--amd-gray-700)]">{deliverable}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container-amd">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-[var(--amd-black)] rounded-2xl p-8 lg:p-12 text-center"
          >
            <h2 className="font-heading text-3xl lg:text-4xl font-bold text-white mb-4">
              Ready for Similar Results?
            </h2>
            <p className="text-[var(--amd-gray-400)] max-w-2xl mx-auto mb-8">
              Lets discuss how we can help your business achieve remarkable growth through strategic marketing.
            </p>
            <Button
              onClick={() => onNavigate('proposal')}
              className="bg-[var(--amd-gold)] text-[var(--amd-black)] hover:bg-[var(--amd-gold-light)] px-8"
            >
              Get Your Proposal
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
