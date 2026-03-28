import { useState, useEffect } from 'react';
import { Menu, X, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Page = 'home' | 'about' | 'services' | 'portfolio' | 'contact' | 'proposal' | 'case-study';

interface HeaderProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export function Header({ currentPage, onNavigate }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Home', page: 'home' as Page },
    { label: 'About', page: 'about' as Page },
    { label: 'Services', page: 'services' as Page },
    { label: 'Portfolio', page: 'portfolio' as Page },
    { label: 'Contact', page: 'contact' as Page },
  ];

  const handleNavClick = (page: Page) => {
    onNavigate(page);
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="container-amd">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3"
          >
            <img
              src="/images/amd-logo.jpg"
              alt="AMT Solutions"
              className="h-10 w-auto"
            />
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.page}
                onClick={() => handleNavClick(item.page)}
                className={`text-sm font-medium transition-colors ${
                  currentPage === item.page
                    ? 'text-[var(--amd-black)]'
                    : 'text-[var(--amd-gray-600)] hover:text-[var(--amd-black)]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <a
              href="tel:+201001234567"
              className="flex items-center gap-2 text-sm text-[var(--amd-gray-600)] hover:text-[var(--amd-black)] transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>+20 100 123 4567</span>
            </a>
            <Button
              onClick={() => handleNavClick('proposal')}
              className="bg-[var(--amd-black)] text-white hover:bg-[var(--amd-charcoal)] px-6"
            >
              Get Proposal
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-[var(--amd-gray-200)]">
          <div className="container-amd py-4">
            <nav className="flex flex-col gap-4">
              {navItems.map((item) => (
                <button
                  key={item.page}
                  onClick={() => handleNavClick(item.page)}
                  className={`text-left py-2 text-base font-medium ${
                    currentPage === item.page
                      ? 'text-[var(--amd-black)]'
                      : 'text-[var(--amd-gray-600)]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <hr className="border-[var(--amd-gray-200)]" />
              <Button
                onClick={() => handleNavClick('proposal')}
                className="bg-[var(--amd-black)] text-white hover:bg-[var(--amd-charcoal)] w-full"
              >
                Get Proposal
              </Button>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
