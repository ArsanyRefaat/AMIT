import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, Instagram, Linkedin, Facebook } from 'lucide-react';
import { toast } from 'sonner';
import { API_BASE } from '@/lib/api';

type Page = 'home' | 'about' | 'services' | 'portfolio' | 'contact' | 'case-study';

interface ContactProps {
  onNavigate: (page: Page) => void;
}

type CompanySettings = {
  companyName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
};

export function Contact({ }: ContactProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [company, setCompany] = useState<CompanySettings | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/contact-messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          company: formData.company || null,
          message: formData.message,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        let msg = text || 'Failed to send message.';
        try {
          const j = JSON.parse(text);
          if (j?.error) msg = j.error;
        } catch {
          // ignore JSON parse error
        }
        throw new Error(msg);
      }

      setIsSubmitted(true);
      toast.success("Message sent! We'll get back to you within 24 hours.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send message.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const loadCompany = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/settings/company`);
        if (!res.ok) return;
        const data = await res.json();
        setCompany({
          companyName: data.companyName ?? '',
          email: data.email ?? '',
          phone: data.phone ?? '',
          address: data.address ?? '',
          city: data.city ?? '',
          country: data.country ?? '',
        });
      } catch {
        // ignore, fall back to hardcoded defaults below
      }
    };
    loadCompany();
  }, []);

  const contactInfo = [
    {
      icon: Phone,
      title: 'Call Us',
      content: company?.phone || '+20 100 123 4567',
      href: `tel:${(company?.phone || '+201001234567').replace(/\s+/g, '')}`,
    },
    {
      icon: Mail,
      title: 'Email Us',
      content: company?.email || 'hello@amtsolutions.com',
      href: `mailto:${company?.email || 'hello@amtsolutions.com'}`,
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      content:
        company
          ? `${company.address}${company.city ? `, ${company.city}` : ''}${company.country ? `, ${company.country}` : ''}`
          : '123 Nile Corniche, Cairo',
      href: '#',
    },
    {
      icon: Clock,
      title: 'Hours',
      content: 'Sun - Thu: 9:00 AM - 6:00 PM',
      href: '#',
    },
  ];

  return (
    <div className="pt-20 md:pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-10 md:mb-14"
        >
          <span className="inline-block px-4 py-2 bg-[#C9A962]/10 rounded-full text-xs md:text-sm font-medium text-[#8B7355] mb-4">
            Contact Us
          </span>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-4">
            Let&apos;s Start a Conversation
          </h1>
          <p className="text-base md:text-lg text-gray-600">
            Have a project in mind? We&apos;d love to hear from you.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="space-y-4 md:space-y-6">
              {contactInfo.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                  className="flex items-start gap-3 md:gap-4"
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-black flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-[#C9A962]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-black text-sm md:text-base mb-0.5">{item.title}</h3>
                    <a
                      href={item.href}
                      className="text-gray-600 hover:text-[#C9A962] transition-colors text-sm md:text-base"
                    >
                      {item.content}
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Social Links */}
            <div className="mt-8 md:mt-10">
              <h3 className="font-semibold text-black mb-3 md:mb-4 text-sm md:text-base">Follow Us</h3>
              <div className="flex gap-3">
                {[
                  { icon: Instagram, label: 'Instagram' },
                  { icon: Linkedin, label: 'LinkedIn' },
                  { icon: Facebook, label: 'Facebook' },
                ].map((social) => (
                  <a
                    key={social.label}
                    href="#"
                    className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-black hover:text-[#C9A962] transition-colors"
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-10 shadow-lg border border-gray-100">
              {isSubmitted ? (
                <div className="text-center py-10 md:py-14">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5 md:mb-6">
                    <CheckCircle2 className="w-8 h-8 md:w-10 md:h-10 text-green-600" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-black mb-3">
                    Message Sent Successfully!
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Thank you for reaching out. We&apos;ll get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="px-6 py-3 border border-gray-200 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <h3 className="text-lg md:text-xl font-bold text-black mb-5 md:mb-6">
                    Send Us a Message
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4 md:gap-5 mb-4 md:mb-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm md:text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm md:text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+20 100 123 4567"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm md:text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Company Name
                      </label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        placeholder="Your Company"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm md:text-base"
                      />
                    </div>
                  </div>
                  <div className="mb-5 md:mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Your Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us about your project..."
                      required
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm md:text-base resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 md:px-8 py-3.5 md:py-4 bg-black text-white font-medium rounded-full flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
                  >
                    <Send className="w-4 h-4 md:w-5 md:h-5" />
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
