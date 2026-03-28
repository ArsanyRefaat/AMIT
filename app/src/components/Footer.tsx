import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';

type Page = 'home' | 'about' | 'services' | 'portfolio' | 'contact' | 'proposal' | 'case-study';

interface FooterProps {
  onNavigate: (page: Page) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: 'Home', page: 'home' as Page },
    { label: 'About Us', page: 'about' as Page },
    { label: 'Services', page: 'services' as Page },
    { label: 'Portfolio', page: 'portfolio' as Page },
    { label: 'Contact', page: 'contact' as Page },
    { label: 'Get Proposal', page: 'proposal' as Page },
  ];

  const services = [
    'Branding & Identity',
    'Social Media Marketing',
    'Performance Marketing',
    'Content Creation',
    'Web Design & Development',
    'SEO & SEM',
  ];

  return (
    <footer className="bg-[var(--amd-black)] text-white">
      <div className="container-amd py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <img
              src="/images/amt-logo.png"
              alt="AMT Solutions"
              className="h-12 w-auto mb-6 invert"
            />
            <p className="text-[var(--amd-gray-400)] text-sm leading-relaxed mb-6">
              AMT Solutions is a leading marketing agency in Egypt, helping businesses grow through strategic branding, digital marketing, and creative solutions.
            </p>
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[var(--amd-gold)] hover:text-[var(--amd-black)] transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[var(--amd-gold)] hover:text-[var(--amd-black)] transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[var(--amd-gold)] hover:text-[var(--amd-black)] transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[var(--amd-gold)] hover:text-[var(--amd-black)] transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-lg font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.page}>
                  <button
                    onClick={() => onNavigate(link.page)}
                    className="text-[var(--amd-gray-400)] hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-heading text-lg font-semibold mb-6">Our Services</h4>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service}>
                  <button
                    onClick={() => onNavigate('services')}
                    className="text-[var(--amd-gray-400)] hover:text-white transition-colors text-sm"
                  >
                    {service}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-heading text-lg font-semibold mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[var(--amd-gold)] mt-0.5 flex-shrink-0" />
                <span className="text-[var(--amd-gray-400)] text-sm">
                  123 Nile Corniche, Suite 500<br />
                  Cairo, Egypt
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[var(--amd-gold)] flex-shrink-0" />
                <a
                  href="tel:+201001234567"
                  className="text-[var(--amd-gray-400)] hover:text-white transition-colors text-sm"
                >
                  +20 100 123 4567
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[var(--amd-gold)] flex-shrink-0" />
                <a
                  href="mailto:hello@amtsolutions.com"
                  className="text-[var(--amd-gray-400)] hover:text-white transition-colors text-sm"
                >
                  hello@amtsolutions.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container-amd py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[var(--amd-gray-400)] text-sm">
              {currentYear} AMT Solutions. All rights reserved.
            </p>
            <div className="flex gap-6">
              <button className="text-[var(--amd-gray-400)] hover:text-white transition-colors text-sm">
                Privacy Policy
              </button>
              <button className="text-[var(--amd-gray-400)] hover:text-white transition-colors text-sm">
                Terms of Service
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
