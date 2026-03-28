import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

type Page = 'home' | 'about' | 'services' | 'portfolio' | 'contact' | 'proposal' | 'case-study';

interface ContactProps {
  onNavigate: (page: Page) => void;
}

export function Contact({ }: ContactProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission
    setIsSubmitted(true);
    toast.success('Thank you for reaching out! We will get back to you within 24 hours.');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const contactInfo = [
    {
      icon: Phone,
      title: 'Phone',
      content: '+20 100 123 4567',
      href: 'tel:+201001234567',
    },
    {
      icon: Mail,
      title: 'Email',
      content: 'hello@amdsolutions.com',
      href: 'mailto:hello@amdsolutions.com',
    },
    {
      icon: MapPin,
      title: 'Address',
      content: '123 Nile Corniche, Suite 500, Cairo, Egypt',
      href: '#',
    },
    {
      icon: Clock,
      title: 'Working Hours',
      content: 'Sun - Thu: 9:00 AM - 6:00 PM',
      href: '#',
    },
  ];

  return (
    <div className="pt-32 pb-20">
      <div className="container-amd">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-2 bg-[var(--amd-gold)]/10 rounded-full text-sm font-medium text-[var(--amd-gold-dark)] mb-4">
            Contact Us
          </span>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--amd-black)] mb-6">
            Lets Start a Conversation
          </h1>
          <p className="text-lg text-[var(--amd-gray-600)]">
            Have a project in mind? Wed love to hear from you. Get in touch and lets create something amazing together.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="space-y-6">
              {contactInfo.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-12 h-12 rounded-lg bg-[var(--amd-black)] flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-[var(--amd-gold)]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--amd-black)] mb-1">{item.title}</h3>
                    <a
                      href={item.href}
                      className="text-[var(--amd-gray-600)] hover:text-[var(--amd-gold)] transition-colors"
                    >
                      {item.content}
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Social Links */}
            <div className="mt-10">
              <h3 className="font-semibold text-[var(--amd-black)] mb-4">Follow Us</h3>
              <div className="flex gap-3">
                {['Facebook', 'Instagram', 'LinkedIn', 'Twitter'].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="w-10 h-10 rounded-lg bg-[var(--amd-gray-100)] flex items-center justify-center hover:bg-[var(--amd-black)] hover:text-[var(--amd-gold)] transition-colors"
                  >
                    <span className="text-xs font-medium">{social.charAt(0)}</span>
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
            <div className="bg-white rounded-2xl p-8 lg:p-12 shadow-lg border border-[var(--amd-gray-200)]">
              {isSubmitted ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="font-heading text-2xl font-bold text-[var(--amd-black)] mb-4">
                    Message Sent Successfully!
                  </h3>
                  <p className="text-[var(--amd-gray-600)] mb-6">
                    Thank you for reaching out. Our team will get back to you within 24 hours.
                  </p>
                  <Button
                    onClick={() => setIsSubmitted(false)}
                    variant="outline"
                    className="border-[var(--amd-gray-300)]"
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <h3 className="font-heading text-2xl font-bold text-[var(--amd-black)] mb-6">
                    Send Us a Message
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-6 mb-6">
                    <div>
                      <Label htmlFor="name" className="text-[var(--amd-gray-700)]">
                        Full Name *
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        required
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-[var(--amd-gray-700)]">
                        Email Address *
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        required
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-[var(--amd-gray-700)]">
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+20 100 123 4567"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="company" className="text-[var(--amd-gray-700)]">
                        Company Name
                      </Label>
                      <Input
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        placeholder="Your Company"
                        className="mt-2"
                      />
                    </div>
                  </div>
                  <div className="mb-6">
                    <Label htmlFor="message" className="text-[var(--amd-gray-700)]">
                      Your Message *
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us about your project..."
                      required
                      rows={5}
                      className="mt-2"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="bg-[var(--amd-black)] text-white hover:bg-[var(--amd-charcoal)] px-8"
                  >
                    <Send className="mr-2 w-4 h-4" />
                    Send Message
                  </Button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
