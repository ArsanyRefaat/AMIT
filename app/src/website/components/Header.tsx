import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE } from '@/lib/api';

type Page = 'home' | 'about' | 'services' | 'portfolio' | 'contact' | 'case-study';

interface HeaderProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
}

export function Header({ currentPage, onNavigate, isMenuOpen, setIsMenuOpen }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [logoUrl, setLogoUrl] = useState('/images/amt-logo.png');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const loadLogo = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/settings/company`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.logoUrl) {
          setLogoUrl(data.logoUrl);
        }
      } catch {
        // keep default logo on error
      }
    };
    loadLogo();
  }, []);

  const navItems = [
    { label: 'Home', page: 'home' as Page },
    { label: 'About', page: 'about' as Page },
    { label: 'Services', page: 'services' as Page },
    { label: 'Work', page: 'portfolio' as Page },
    { label: 'Contact', page: 'contact' as Page },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center"
            >
              <img
                src={logoUrl}
                alt="AMT Solutions"
                className="h-8 md:h-10 w-auto"
              />
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <button
                  key={item.page}
                  onClick={() => onNavigate(item.page)}
                  className={`relative text-sm font-medium transition-colors py-2 ${
                    currentPage === item.page
                      ? 'text-black'
                      : 'text-gray-500 hover:text-black'
                  }`}
                >
                  {item.label}
                  {currentPage === item.page && (
                    <motion.div
                      layoutId="navIndicator"
                      className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-[#C9A962]"
                    />
                  )}
                </button>
              ))}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={() => onNavigate('contact')}
                className="px-5 py-2.5 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors"
              >
                Get in Touch
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 -mr-2 rounded-lg hover:bg-black/5 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-16 z-40 bg-white border-b border-gray-100 shadow-lg md:hidden"
          >
            <nav className="px-4 py-6 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.page}
                  onClick={() => onNavigate(item.page)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                    currentPage === item.page
                      ? 'bg-black text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <div className="pt-4 mt-4 border-t border-gray-100">
                <button
                  onClick={() => onNavigate('contact')}
                  className="w-full px-4 py-3 bg-[#C9A962] text-black font-medium rounded-xl"
                >
                  Get in Touch
                </button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
