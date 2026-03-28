import { useState } from 'react';
import { Quote, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { testimonials } from '@/data/mockData';

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section className="section-padding bg-[var(--amd-gray-50)]">
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
            Testimonials
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--amd-black)] mb-6">
            What Our Clients Say
          </h2>
          <p className="text-lg text-[var(--amd-gray-600)]">
            Dont just take our word for it. Heres what our clients have to say about working with us.
          </p>
        </motion.div>

        {/* Testimonial Card */}
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl p-8 lg:p-12 shadow-lg"
              >
                <Quote className="w-12 h-12 text-[var(--amd-gold)] mb-6" />

                {/* Rating */}
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < currentTestimonial.rating
                          ? 'fill-[var(--amd-gold)] text-[var(--amd-gold)]'
                          : 'text-[var(--amd-gray-300)]'
                      }`}
                    />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-xl lg:text-2xl text-[var(--amd-gray-800)] leading-relaxed mb-8 font-heading">
                  &ldquo;{currentTestimonial.content}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-[var(--amd-black)] flex items-center justify-center">
                    <span className="text-xl font-semibold text-[var(--amd-gold)]">
                      {currentTestimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-[var(--amd-black)]">
                      {currentTestimonial.name}
                    </div>
                    <div className="text-sm text-[var(--amd-gray-500)]">
                      {currentTestimonial.position}, {currentTestimonial.company}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-center items-center gap-4 mt-8">
              <button
                onClick={prevTestimonial}
                className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-[var(--amd-gray-100)] transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Dots */}
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentIndex
                        ? 'w-8 bg-[var(--amd-gold)]'
                        : 'bg-[var(--amd-gray-300)]'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={nextTestimonial}
                className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-[var(--amd-gray-100)] transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
