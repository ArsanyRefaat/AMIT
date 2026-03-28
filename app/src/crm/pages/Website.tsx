import { useEffect, useState } from 'react';
import { Layout, FileText, Image, MessageSquare, Settings, ExternalLink, Save, Plus, Eye, EyeOff, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { API_BASE } from '@/lib/api';

type WebsiteSettingsForm = {
  heroTitle: string;
  heroSubtitle: string;
  heroCtaText: string;
  statsProjectsDelivered: string;
  statsHappyClients: string;
  statsIndustryAwards: string;
  statsClientSatisfaction: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
};

type WebsiteService = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  icon: string;
  order: number;
  isActive: boolean;
};

type WebsiteTestimonial = {
  id: string;
  name: string;
  position: string;
  company: string;
  content: string;
  rating: number;
  order: number;
  isActive: boolean;
};

export function Website() {
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<WebsiteSettingsForm>({
    heroTitle: '',
    heroSubtitle: '',
    heroCtaText: '',
    statsProjectsDelivered: '',
    statsHappyClients: '',
    statsIndustryAwards: '',
    statsClientSatisfaction: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
  });
  const [services, setServices] = useState<WebsiteService[]>([]);
  const [testimonials, setTestimonials] = useState<WebsiteTestimonial[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [settingsRes, servicesRes, testimonialsRes] = await Promise.all([
          fetch(`${API_BASE}/api/website-settings`),
          fetch(`${API_BASE}/api/website-services`),
          fetch(`${API_BASE}/api/website-testimonials`),
        ]);

        if (!settingsRes.ok) {
          throw new Error(`Failed to load website settings (${settingsRes.status})`);
        }
        const settingsData = await settingsRes.json();
        setSettings({
          heroTitle: settingsData.heroTitle ?? '',
          heroSubtitle: settingsData.heroSubtitle ?? '',
          heroCtaText: settingsData.heroCtaText ?? '',
          statsProjectsDelivered: settingsData.statsProjectsDelivered ?? '',
          statsHappyClients: settingsData.statsHappyClients ?? '',
          statsIndustryAwards: settingsData.statsIndustryAwards ?? '',
          statsClientSatisfaction: settingsData.statsClientSatisfaction ?? '',
          metaTitle: settingsData.metaTitle ?? '',
          metaDescription: settingsData.metaDescription ?? '',
          metaKeywords: settingsData.metaKeywords ?? '',
        });

        if (servicesRes.ok) {
          const servicesData: WebsiteService[] = await servicesRes.json();
          setServices(
            servicesData
              .slice()
              .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))
          );
        }

        if (testimonialsRes.ok) {
          const testimonialsData: WebsiteTestimonial[] = await testimonialsRes.json();
          setTestimonials(
            testimonialsData
              .slice()
              .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
          );
        }
      } catch (e) {
        console.error(e);
        toast.error('Failed to load website settings.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    const payload = {
      heroTitle: settings.heroTitle,
      heroSubtitle: settings.heroSubtitle,
      heroCtaText: settings.heroCtaText,
      statsProjectsDelivered: settings.statsProjectsDelivered,
      statsHappyClients: settings.statsHappyClients,
      statsIndustryAwards: settings.statsIndustryAwards,
      statsClientSatisfaction: settings.statsClientSatisfaction,
      metaTitle: settings.metaTitle,
      metaDescription: settings.metaDescription,
      metaKeywords: settings.metaKeywords,
    };

    Promise.all([
      fetch(`${API_BASE}/api/website-settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
      fetch(`${API_BASE}/api/website-services`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(services),
      }),
      fetch(`${API_BASE}/api/website-testimonials`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testimonials),
      }),
    ])
      .then(async ([settingsRes, servicesRes, testimonialsRes]) => {
        const firstError = [settingsRes, servicesRes, testimonialsRes].find((r) => !r.ok);
        if (firstError) {
          const text = await firstError.text();
          let msg = text || 'Failed to save website settings.';
          try {
            const j = JSON.parse(text);
            if (j?.error) msg = j.error;
          } catch {
            // ignore
          }
          throw new Error(msg);
        }
        const data = await settingsRes.json();
        setSettings({
          heroTitle: data.heroTitle ?? '',
          heroSubtitle: data.heroSubtitle ?? '',
          heroCtaText: data.heroCtaText ?? '',
          statsProjectsDelivered: data.statsProjectsDelivered ?? '',
          statsHappyClients: data.statsHappyClients ?? '',
          statsIndustryAwards: data.statsIndustryAwards ?? '',
          statsClientSatisfaction: data.statsClientSatisfaction ?? '',
          metaTitle: data.metaTitle ?? '',
          metaDescription: data.metaDescription ?? '',
          metaKeywords: data.metaKeywords ?? '',
        });
        toast.success('Changes saved successfully!');
      })
      .catch((e: unknown) => {
        toast.error(e instanceof Error ? e.message : 'Failed to save website settings.');
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  const sections = [
    { id: 'homepage', label: 'Homepage', icon: Layout },
    { id: 'services', label: 'Services', icon: FileText },
    { id: 'portfolio', label: 'Portfolio', icon: Image },
    { id: 'testimonials', label: 'Testimonials', icon: MessageSquare },
    { id: 'settings', label: 'SEO Settings', icon: Settings },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <p className="text-[var(--amd-gray-500)]">Loading website settings…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="font-heading text-2xl lg:text-3xl font-bold text-[var(--amd-black)]">
            Website Management
          </h1>
          <p className="text-[var(--amd-gray-500)] mt-1">Manage your website content and settings</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => window.open('/', '_blank')}>
            <ExternalLink className="w-4 h-4 mr-2" />
            View Site
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[var(--amd-black)] text-white hover:bg-[var(--amd-charcoal)]"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Tabs defaultValue="homepage" className="space-y-6">
          <TabsList className="grid grid-cols-2 lg:grid-cols-5 w-full">
            {sections.map((section) => (
              <TabsTrigger key={section.id} value={section.id} className="flex items-center gap-2">
                <section.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{section.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="homepage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-lg">Hero Section</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-[var(--amd-gray-700)]">Hero Title</label>
                  <Input
                    className="mt-1"
                    value={settings.heroTitle}
                    onChange={(e) => setSettings((prev) => ({ ...prev, heroTitle: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[var(--amd-gray-700)]">Hero Subtitle</label>
                  <Input
                    className="mt-1"
                    value={settings.heroSubtitle}
                    onChange={(e) => setSettings((prev) => ({ ...prev, heroSubtitle: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[var(--amd-gray-700)]">CTA Button Text</label>
                  <Input
                    className="mt-1"
                    value={settings.heroCtaText}
                    onChange={(e) => setSettings((prev) => ({ ...prev, heroCtaText: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-lg">Stats Section</CardTitle>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-[var(--amd-gray-700)]">Projects Delivered</label>
                  <Input
                    className="mt-1"
                    value={settings.statsProjectsDelivered}
                    onChange={(e) => setSettings((prev) => ({ ...prev, statsProjectsDelivered: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[var(--amd-gray-700)]">Happy Clients</label>
                  <Input
                    className="mt-1"
                    value={settings.statsHappyClients}
                    onChange={(e) => setSettings((prev) => ({ ...prev, statsHappyClients: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[var(--amd-gray-700)]">Industry Awards</label>
                  <Input
                    className="mt-1"
                    value={settings.statsIndustryAwards}
                    onChange={(e) => setSettings((prev) => ({ ...prev, statsIndustryAwards: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[var(--amd-gray-700)]">Client Satisfaction</label>
                  <Input
                    className="mt-1"
                    value={settings.statsClientSatisfaction}
                    onChange={(e) => setSettings((prev) => ({ ...prev, statsClientSatisfaction: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="font-heading text-lg">Services</CardTitle>
                  <p className="text-sm text-[var(--amd-gray-500)] mt-1">
                    Control which services appear on the public website.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const nextOrder = services.length + 1;
                    setServices((prev) => [
                      ...prev,
                      {
                        id: crypto.randomUUID(),
                        slug: `service-${nextOrder}`,
                        title: 'New Service',
                        shortDescription: '',
                        fullDescription: '',
                        icon: 'Target',
                        order: nextOrder,
                        isActive: true,
                      },
                    ]);
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Service
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {services
                  .slice()
                  .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))
                  .map((service, index) => (
                    <div
                      key={service.id}
                      className="border border-[var(--amd-gray-100)] rounded-lg p-4 flex flex-col gap-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[var(--amd-gray-500)]">#{service.order}</span>
                          <Input
                            className="font-medium"
                            value={service.title}
                            onChange={(e) =>
                              setServices((prev) =>
                                prev.map((s) =>
                                  s.id === service.id ? { ...s, title: e.target.value } : s
                                )
                              )
                            }
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setServices((prev) =>
                                prev.map((s) =>
                                  s.id === service.id ? { ...s, isActive: !s.isActive } : s
                                )
                              )
                            }
                            title={service.isActive ? 'Hide on website' : 'Show on website'}
                          >
                            {service.isActive ? (
                              <Eye className="w-4 h-4" />
                            ) : (
                              <EyeOff className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (index === 0) return;
                              setServices((prev) => {
                                const copy = [...prev].sort(
                                  (a, b) => a.order - b.order || a.title.localeCompare(b.title)
                                );
                                copy.splice(index - 1, 1);
                                copy.splice(index - 1, 0, service);
                                return copy.map((s, idx) => ({ ...s, order: idx + 1 }));
                              });
                            }}
                            title="Move up"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setServices((prev) => {
                                const ordered = [...prev].sort(
                                  (a, b) => a.order - b.order || a.title.localeCompare(b.title)
                                );
                                if (index >= ordered.length - 1) return prev;
                                const [current] = ordered.splice(index, 1);
                                ordered.splice(index + 1, 0, current);
                                return ordered.map((s, idx) => ({ ...s, order: idx + 1 }));
                              });
                            }}
                            title="Move down"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium text-[var(--amd-gray-600)]">
                            Short Description
                          </label>
                          <Input
                            className="mt-1"
                            value={service.shortDescription}
                            onChange={(e) =>
                              setServices((prev) =>
                                prev.map((s) =>
                                  s.id === service.id
                                    ? { ...s, shortDescription: e.target.value }
                                    : s
                                )
                              )
                            }
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-[var(--amd-gray-600)]">
                            Icon (Lucide name)
                          </label>
                          <Input
                            className="mt-1"
                            value={service.icon}
                            onChange={(e) =>
                              setServices((prev) =>
                                prev.map((s) =>
                                  s.id === service.id ? { ...s, icon: e.target.value } : s
                                )
                              )
                            }
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-[var(--amd-gray-600)]">
                          Full Description
                        </label>
                        <textarea
                          className="mt-1 w-full min-h-[80px] rounded-md border border-[var(--amd-gray-200)] bg-white px-3 py-2 text-sm"
                          value={service.fullDescription}
                          onChange={(e) =>
                            setServices((prev) =>
                              prev.map((s) =>
                                s.id === service.id ? { ...s, fullDescription: e.target.value } : s
                              )
                            )
                          }
                        />
                      </div>
                    </div>
                  ))}
                {services.length === 0 && (
                  <p className="text-sm text-[var(--amd-gray-500)]">
                    No services defined yet. Click &quot;Add Service&quot; to create one.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-lg">Services Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[var(--amd-gray-600)]">
                  Manage your services from the Products & Services section. Changes will be reflected on the website automatically.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-lg">Portfolio Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[var(--amd-gray-600)]">
                  Portfolio projects are managed through the Projects section. Mark projects as featured to display them on the homepage.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="testimonials" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="font-heading text-lg">Client Testimonials</CardTitle>
                  <p className="text-sm text-[var(--amd-gray-500)] mt-1">
                    Manage the testimonials that appear on the public website.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const nextOrder = testimonials.length + 1;
                    setTestimonials((prev) => [
                      ...prev,
                      {
                        id: crypto.randomUUID(),
                        name: '',
                        position: '',
                        company: '',
                        content: '',
                        rating: 5,
                        order: nextOrder,
                        isActive: true,
                      },
                    ]);
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Testimonial
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {testimonials
                  .slice()
                  .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
                  .map((testimonial, index) => (
                    <div
                      key={testimonial.id}
                      className="border border-[var(--amd-gray-100)] rounded-lg p-4 flex flex-col gap-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs text-[var(--amd-gray-500)]">#{testimonial.order}</span>
                          <Input
                            className="w-36"
                            placeholder="Name"
                            value={testimonial.name}
                            onChange={(e) =>
                              setTestimonials((prev) =>
                                prev.map((t) =>
                                  t.id === testimonial.id ? { ...t, name: e.target.value } : t
                                )
                              )
                            }
                          />
                          <Input
                            className="w-40"
                            placeholder="Position"
                            value={testimonial.position}
                            onChange={(e) =>
                              setTestimonials((prev) =>
                                prev.map((t) =>
                                  t.id === testimonial.id ? { ...t, position: e.target.value } : t
                                )
                              )
                            }
                          />
                          <Input
                            className="w-40"
                            placeholder="Company"
                            value={testimonial.company}
                            onChange={(e) =>
                              setTestimonials((prev) =>
                                prev.map((t) =>
                                  t.id === testimonial.id ? { ...t, company: e.target.value } : t
                                )
                              )
                            }
                          />
                          <Input
                            className="w-24"
                            type="number"
                            min={1}
                            max={5}
                            placeholder="Rating"
                            value={testimonial.rating}
                            onChange={(e) => {
                              const value = Number(e.target.value) || 0;
                              setTestimonials((prev) =>
                                prev.map((t) =>
                                  t.id === testimonial.id ? { ...t, rating: value } : t
                                )
                              );
                            }}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setTestimonials((prev) =>
                                prev.map((t) =>
                                  t.id === testimonial.id ? { ...t, isActive: !t.isActive } : t
                                )
                              )
                            }
                            title={testimonial.isActive ? 'Hide on website' : 'Show on website'}
                          >
                            {testimonial.isActive ? (
                              <Eye className="w-4 h-4" />
                            ) : (
                              <EyeOff className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (index === 0) return;
                              setTestimonials((prev) => {
                                const ordered = [...prev].sort(
                                  (a, b) => a.order - b.order || a.name.localeCompare(b.name)
                                );
                                ordered.splice(index - 1, 1);
                                ordered.splice(index - 1, 0, testimonial);
                                return ordered.map((t, idx) => ({ ...t, order: idx + 1 }));
                              });
                            }}
                            title="Move up"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setTestimonials((prev) => {
                                const ordered = [...prev].sort(
                                  (a, b) => a.order - b.order || a.name.localeCompare(b.name)
                                );
                                if (index >= ordered.length - 1) return prev;
                                const [current] = ordered.splice(index, 1);
                                ordered.splice(index + 1, 0, current);
                                return ordered.map((t, idx) => ({ ...t, order: idx + 1 }));
                              });
                            }}
                            title="Move down"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setTestimonials((prev) =>
                                prev
                                  .filter((t) => t.id !== testimonial.id)
                                  .map((t, idx) => ({ ...t, order: idx + 1 }))
                              )
                            }
                            title="Delete"
                          >
                            ✕
                          </Button>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-[var(--amd-gray-600)]">
                          Quote
                        </label>
                        <textarea
                          className="mt-1 w-full min-h-[80px] rounded-md border border-[var(--amd-gray-200)] bg-white px-3 py-2 text-sm"
                          value={testimonial.content}
                          onChange={(e) =>
                            setTestimonials((prev) =>
                              prev.map((t) =>
                                t.id === testimonial.id ? { ...t, content: e.target.value } : t
                              )
                            )
                          }
                        />
                      </div>
                    </div>
                  ))}
                {testimonials.length === 0 && (
                  <p className="text-sm text-[var(--amd-gray-500)]">
                    No testimonials yet. Click &quot;Add Testimonial&quot; to create one.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-lg">SEO Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-[var(--amd-gray-700)]">Meta Title</label>
                  <Input
                    className="mt-1"
                    value={settings.metaTitle}
                    onChange={(e) => setSettings((prev) => ({ ...prev, metaTitle: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[var(--amd-gray-700)]">Meta Description</label>
                  <textarea
                    rows={3}
                    className="w-full mt-1 px-4 py-2 rounded-lg border border-[var(--amd-gray-200)] focus:outline-none focus:ring-2 focus:ring-[var(--amd-black)]"
                    value={settings.metaDescription}
                    onChange={(e) => setSettings((prev) => ({ ...prev, metaDescription: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[var(--amd-gray-700)]">Keywords</label>
                  <Input
                    className="mt-1"
                    value={settings.metaKeywords}
                    onChange={(e) => setSettings((prev) => ({ ...prev, metaKeywords: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
