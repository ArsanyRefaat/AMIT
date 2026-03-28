import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Hero } from './sections/Hero';
import { Services } from './sections/Services';
import { Portfolio } from './sections/Portfolio';
import { WhyUs } from './sections/WhyUs';
import { Testimonials } from './sections/Testimonials';
import { CTA } from './sections/CTA';
import { About } from './sections/About';
import { Contact } from './sections/Contact';
import { CaseStudy } from './sections/CaseStudy';
import { API_BASE } from '@/lib/api';

type AppView = 'entry' | 'website' | 'crm';
type Page = 'home' | 'about' | 'services' | 'portfolio' | 'contact' | 'case-study';

type WebsiteSettings = {
  heroTitle: string;
  heroSubtitle: string;
  heroCtaText: string;
  statsProjectsDelivered: string;
  statsHappyClients: string;
  statsIndustryAwards: string;
  statsClientSatisfaction: string;
};

interface WebsiteAppProps {
  onNavigate: (view: AppView) => void;
}

export function WebsiteApp({ onNavigate }: WebsiteAppProps) {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedCaseStudy, setSelectedCaseStudy] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/website-settings`);
        if (!res.ok) return;
        const data = await res.json();
        setSettings({
          heroTitle: data.heroTitle ?? '',
          heroSubtitle: data.heroSubtitle ?? '',
          heroCtaText: data.heroCtaText ?? '',
          statsProjectsDelivered: data.statsProjectsDelivered ?? '',
          statsHappyClients: data.statsHappyClients ?? '',
          statsIndustryAwards: data.statsIndustryAwards ?? '',
          statsClientSatisfaction: data.statsClientSatisfaction ?? '',
        });
      } catch {
        // ignore, fall back to defaults in Hero
      }
    };
    loadSettings();
  }, []);

  const handleNavigate = (page: Page, params?: { caseStudy?: string }) => {
    if (params?.caseStudy) {
      setSelectedCaseStudy(params.caseStudy);
    }
    setCurrentPage(page);
    setIsMenuOpen(false);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <>
            <Hero
              onNavigate={handleNavigate}
              heroTitle={settings?.heroTitle}
              heroSubtitle={settings?.heroSubtitle}
              projectsStat={settings?.statsProjectsDelivered}
              clientsStat={settings?.statsHappyClients}
              awardsStat={settings?.statsIndustryAwards}
            />
            <Services />
            <Portfolio onNavigate={handleNavigate} />
            <WhyUs />
            <Testimonials />
            <CTA onNavigate={handleNavigate} />
          </>
        );
      case 'about':
        return <About onNavigate={handleNavigate} />;
      case 'services':
        return (
          <>
            <Services fullPage />
            <CTA onNavigate={handleNavigate} />
          </>
        );
      case 'portfolio':
        return (
          <>
            <Portfolio onNavigate={handleNavigate} fullPage />
            <CTA onNavigate={handleNavigate} />
          </>
        );
      case 'case-study':
        return selectedCaseStudy ? (
          <CaseStudy slug={selectedCaseStudy} onNavigate={handleNavigate} />
        ) : (
          <Portfolio onNavigate={handleNavigate} fullPage />
        );
      case 'contact':
        return <Contact onNavigate={handleNavigate} />;
      default:
        return (
          <>
            <Hero onNavigate={handleNavigate} />
            <Services />
            <Portfolio onNavigate={handleNavigate} />
            <WhyUs />
            <Testimonials />
            <CTA onNavigate={handleNavigate} />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header 
        currentPage={currentPage} 
        onNavigate={handleNavigate} 
        onBackToEntry={() => onNavigate('entry')}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
      />
      <main className="pt-16 md:pt-20">{renderPage()}</main>
      <Footer onNavigate={handleNavigate} onBackToEntry={() => onNavigate('entry')} />
    </div>
  );
}
