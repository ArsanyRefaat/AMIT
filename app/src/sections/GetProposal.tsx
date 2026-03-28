import { useState } from 'react';
import { ArrowRight, ArrowLeft, CheckCircle2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { services } from '@/data/mockData';

type Page = 'home' | 'about' | 'services' | 'portfolio' | 'contact' | 'proposal' | 'case-study';

interface GetProposalProps {
  onNavigate: (page: Page) => void;
}

export function GetProposal({ onNavigate }: GetProposalProps) {
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    industry: '',
    budget: '',
    services: [] as string[],
    timeline: '',
    message: '',
  });

  const industries = [
    'Technology',
    'Healthcare',
    'Real Estate',
    'Retail',
    'Finance',
    'Education',
    'Hospitality',
    'Manufacturing',
    'Other',
  ];

  const budgets = [
    'Under 50,000 EGP',
    '50,000 - 100,000 EGP',
    '100,000 - 250,000 EGP',
    '250,000 - 500,000 EGP',
    'Over 500,000 EGP',
  ];

  const timelines = [
    'ASAP',
    'Within 1 month',
    '1-3 months',
    '3-6 months',
    'Just exploring',
  ];

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    toast.success('Proposal request submitted! We will contact you within 24 hours.');
  };

  const handleServiceToggle = (serviceId: string) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.includes(serviceId)
        ? prev.services.filter((s) => s !== serviceId)
        : [...prev.services, serviceId],
    }));
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.name && formData.email && formData.phone;
      case 2:
        return formData.company && formData.industry;
      case 3:
        return formData.services.length > 0;
      case 4:
        return formData.budget && formData.timeline;
      default:
        return true;
    }
  };

  if (isSubmitted) {
    return (
      <div className="pt-32 pb-20 min-h-screen flex items-center">
        <div className="container-amd">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-8">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="font-heading text-4xl font-bold text-[var(--amd-black)] mb-4">
              Thank You!
            </h1>
            <p className="text-lg text-[var(--amd-gray-600)] mb-8">
              Weve received your proposal request. Our team will review your requirements and get back to you within 24 hours with a customized proposal.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => onNavigate('home')}
                className="bg-[var(--amd-black)] text-white hover:bg-[var(--amd-charcoal)]"
              >
                Back to Home
              </Button>
              <Button
                onClick={() => onNavigate('portfolio')}
                variant="outline"
                className="border-[var(--amd-gray-300)]"
              >
                View Our Work
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 min-h-screen bg-[var(--amd-gray-50)]">
      <div className="container-amd">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-10">
            <span className="inline-block px-4 py-2 bg-[var(--amd-gold)]/10 rounded-full text-sm font-medium text-[var(--amd-gold-dark)] mb-4">
              Get a Proposal
            </span>
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--amd-black)] mb-4">
              Lets Discuss Your Project
            </h1>
            <p className="text-[var(--amd-gray-600)]">
              Tell us about your needs and well create a customized proposal for you.
            </p>
          </div>

          {/* Progress */}
          <div className="flex items-center justify-center gap-2 mb-10">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${
                    s <= step
                      ? 'bg-[var(--amd-black)] text-white'
                      : 'bg-[var(--amd-gray-200)] text-[var(--amd-gray-500)]'
                  }`}
                >
                  {s < step ? <CheckCircle2 className="w-5 h-5" /> : s}
                </div>
                {s < 4 && (
                  <div
                    className={`w-12 h-1 mx-2 ${
                      s < step ? 'bg-[var(--amd-black)]' : 'bg-[var(--amd-gray-200)]'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl p-8 lg:p-12 shadow-lg">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="font-heading text-2xl font-bold text-[var(--amd-black)] mb-6">
                    Step 1: Contact Information
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="sm:col-span-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@example.com"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+20 100 123 4567"
                        className="mt-2"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="font-heading text-2xl font-bold text-[var(--amd-black)] mb-6">
                    Step 2: Company Information
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="company">Company Name *</Label>
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="Your Company"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Industry *</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                        {industries.map((industry) => (
                          <button
                            key={industry}
                            type="button"
                            onClick={() => setFormData({ ...formData, industry })}
                            className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                              formData.industry === industry
                                ? 'bg-[var(--amd-black)] text-white'
                                : 'bg-[var(--amd-gray-100)] text-[var(--amd-gray-700)] hover:bg-[var(--amd-gray-200)]'
                            }`}
                          >
                            {industry}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="font-heading text-2xl font-bold text-[var(--amd-black)] mb-6">
                    Step 3: Services Needed
                  </h2>
                  <p className="text-[var(--amd-gray-600)] mb-4">
                    Select all the services youre interested in:
                  </p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {services.map((service) => (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => handleServiceToggle(service.id)}
                        className={`px-4 py-4 rounded-lg text-left text-sm font-medium transition-all border ${
                          formData.services.includes(service.id)
                            ? 'bg-[var(--amd-black)] text-white border-[var(--amd-black)]'
                            : 'bg-white text-[var(--amd-gray-700)] border-[var(--amd-gray-200)] hover:border-[var(--amd-gray-400)]'
                        }`}
                      >
                        {service.title}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="font-heading text-2xl font-bold text-[var(--amd-black)] mb-6">
                    Step 4: Budget & Timeline
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <Label>Budget Range *</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                        {budgets.map((budget) => (
                          <button
                            key={budget}
                            type="button"
                            onClick={() => setFormData({ ...formData, budget })}
                            className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                              formData.budget === budget
                                ? 'bg-[var(--amd-black)] text-white'
                                : 'bg-[var(--amd-gray-100)] text-[var(--amd-gray-700)] hover:bg-[var(--amd-gray-200)]'
                            }`}
                          >
                            {budget}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label>Timeline *</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                        {timelines.map((timeline) => (
                          <button
                            key={timeline}
                            type="button"
                            onClick={() => setFormData({ ...formData, timeline })}
                            className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                              formData.timeline === timeline
                                ? 'bg-[var(--amd-black)] text-white'
                                : 'bg-[var(--amd-gray-100)] text-[var(--amd-gray-700)] hover:bg-[var(--amd-gray-200)]'
                            }`}
                          >
                            {timeline}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="message">Additional Details</Label>
                      <textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Tell us more about your project..."
                        rows={4}
                        className="w-full mt-2 px-4 py-3 rounded-lg border border-[var(--amd-gray-200)] focus:outline-none focus:ring-2 focus:ring-[var(--amd-black)] focus:border-transparent"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-between mt-10 pt-6 border-t border-[var(--amd-gray-200)]">
              <Button
                type="button"
                onClick={handleBack}
                disabled={step === 1}
                variant="outline"
                className="border-[var(--amd-gray-300)]"
              >
                <ArrowLeft className="mr-2 w-4 h-4" />
                Back
              </Button>
              {step < 4 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={!isStepValid()}
                  className="bg-[var(--amd-black)] text-white hover:bg-[var(--amd-charcoal)]"
                >
                  Next
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!isStepValid()}
                  className="bg-[var(--amd-gold)] text-[var(--amd-black)] hover:bg-[var(--amd-gold-light)]"
                >
                  <Send className="mr-2 w-4 h-4" />
                  Submit Request
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
