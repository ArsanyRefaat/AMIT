import { useEffect, useState } from 'react';
import { Mail, Phone, MapPin, Instagram, Linkedin, Facebook, ArrowUpRight } from 'lucide-react';
import { API_BASE } from '@/lib/api';

type Page = 'home' | 'about' | 'services' | 'portfolio' | 'contact' | 'case-study';

interface FooterProps {
  onNavigate: (page: Page) => void;
  onBackToEntry: () => void;
}

type CompanySettings = {
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
};

export function Footer({ onNavigate, onBackToEntry }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const [company, setCompany] = useState<CompanySettings | null>(null);

  useEffect(() => {
    const loadCompany = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/settings/company`);
        if (!res.ok) return;
        const data = await res.json();
        setCompany({
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

  const quickLinks = [
    { label: 'Home', page: 'home' as Page },
    { label: 'About', page: 'about' as Page },
    { label: 'Services', page: 'services' as Page },
    { label: 'Our Work', page: 'portfolio' as Page },
    { label: 'Contact', page: 'contact' as Page },
  ];

  const services = [
    'Brand Strategy',
    'Digital Marketing',
    'Web Development',
    'Social Media',
    'Content Creation',
    'SEO & SEM',
  ];

  return (
    <footer className="bg-black text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <img
              src="/images/amt-logo.png"
              alt="AMT Solutions"
              className="h-10 w-auto mb-6 invert"
            />
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Premium marketing solutions for businesses that demand excellence. Based in Cairo, serving the MENA region.
            </p>
            <div className="flex gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#C9A962] hover:text-black transition-all"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#C9A962] hover:text-black transition-all"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#C9A962] hover:text-black transition-all"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-5">Navigation</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.page}>
                  <button
                    onClick={() => onNavigate(link.page)}
                    className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-1 group"
                  >
                    {link.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-5">Services</h4>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service}>
                  <button
                    onClick={() => onNavigate('services')}
                    className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-1 group"
                  >
                    {service}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-5">Get in Touch</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#C9A962] mt-0.5 flex-shrink-0" />
                <span className="text-gray-400 text-sm">
                  {company ? (
                    <>
                      {company.address}
                      <br />
                      {[company.city, company.country].filter(Boolean).join(', ')}
                    </>
                  ) : (
                    <>
                      123 Nile Corniche, Suite 500
                      <br />
                      Cairo, Egypt
                    </>
                  )}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#C9A962] flex-shrink-0" />
                <a
                  href={`tel:${(company?.phone || '+201001234567').replace(/\s+/g, '')}`}
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  {company?.phone || '+20 100 123 4567'}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#C9A962] flex-shrink-0" />
                <a
                  href={`mailto:${company?.email || 'hello@amtsolutions.com'}`}
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  {company?.email || 'hello@amtsolutions.com'}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-xs">
              © {currentYear} AMT Solutions. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <button className="text-gray-500 hover:text-white transition-colors text-xs">
                Privacy Policy
              </button>
              <button className="text-gray-500 hover:text-white transition-colors text-xs">
                Terms of Service
              </button>
              <button 
                onClick={onBackToEntry}
                className="text-[#C9A962] hover:text-white transition-colors text-xs"
              >
                System Portal
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
