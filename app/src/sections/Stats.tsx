import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

interface CounterProps {
  end: number;
  suffix?: string;
  prefix?: string;
}

function Counter({ end, suffix = '', prefix = '' }: CounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      const duration = 2000;
      const steps = 60;
      const increment = end / steps;
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);
      return () => clearInterval(timer);
    }
  }, [isInView, end]);

  return (
    <span ref={ref}>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export function Stats() {
  const stats = [
    { value: 150, suffix: '+', label: 'Projects Delivered' },
    { value: 80, suffix: '+', label: 'Happy Clients' },
    { value: 12, suffix: '', label: 'Industry Awards' },
    { value: 98, suffix: '%', label: 'Client Satisfaction' },
    { value: 300, suffix: '%', label: 'Average ROI' },
    { value: 15, suffix: '+', label: 'Years Experience' },
  ];

  return (
    <section className="py-16 lg:py-20 bg-[var(--amd-black)]">
      <div className="container-amd">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-4">
            Numbers That Tell Our Story
          </h2>
          <p className="text-[var(--amd-gray-400)] max-w-2xl mx-auto">
            We let our results speak for themselves. Heres a snapshot of what weve achieved for our clients.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--amd-gold)] mb-2">
                <Counter end={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-[var(--amd-gray-400)] text-sm sm:text-base">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
