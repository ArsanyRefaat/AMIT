import { useEffect, useState } from 'react';
import { Quote, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE } from '@/lib/api';

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [items, setItems] = useState<
    {
      id: string;
      name: string;
      position: string;
      company: string;
      content: string;
      rating: number;
      isActive: boolean;
      order: number;
    }[]
  >([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/website-testimonials`);
        if (!res.ok) throw new Error(`Failed to load testimonials (${res.status})`);
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        setItems(
          list
            .filter((t) => t.isActive !== false)
            .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
        );
        setCurrentIndex(0);
      } catch (err) {
        console.error('Failed to load testimonials.', err);
        setItems([]);
      }
    };
    load();
  }, []);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const hasTestimonials = items.length > 0;
  const currentTestimonial = hasTestimonials ? items[currentIndex] : null;

  return (
    <section className="py-16 md:py-24 bg-gray-50">
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
            Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-4">
            What Clients Say
          </h2>
          <p className="text-base md:text-lg text-gray-600">
            Don&apos;t just take our word for it. Here&apos;s what our clients have to say.
          </p>
        </motion.div>

        {/* Testimonial Card */}
        <div className="max-w-3xl mx-auto">
          {hasTestimonials ? (
            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-3xl p-6 md:p-10 shadow-lg"
                >
                  <Quote className="w-10 h-10 md:w-12 md:h-12 text-[#C9A962] mb-6" />

                  {/* Rating */}
                  <div className="flex gap-1 mb-5 md:mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 md:w-5 md:h-5 ${
                          currentTestimonial && i < currentTestimonial.rating
                            ? 'fill-[#C9A962] text-[#C9A962]'
                            : 'text-gray-200'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-lg md:text-2xl text-gray-800 leading-relaxed mb-6 md:mb-8">
                    &ldquo;{currentTestimonial?.content}&rdquo;
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-black flex items-center justify-center">
                      <span className="text-lg md:text-xl font-bold text-[#C9A962]">
                        {currentTestimonial?.name?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-bold text-black">{currentTestimonial?.name}</div>
                      <div className="text-sm text-gray-500">
                        {currentTestimonial?.position}, {currentTestimonial?.company}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex justify-center items-center gap-3 mt-6 md:mt-8">
                <button
                  onClick={prevTestimonial}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Dots */}
                <div className="flex gap-2">
                  {items.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`h-2 rounded-full transition-all ${
                        index === currentIndex
                          ? 'w-6 md:w-8 bg-[#C9A962]'
                          : 'w-2 bg-gray-300'
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={nextTestimonial}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500">
              No testimonials configured yet. Add testimonials from the Website Management → Testimonials
              tab in the CRM.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
