'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  DollarSign,
  CreditCard,
  FileText,
  Calendar,
  Wrench,
  BarChart3,
  Shield,
  Globe,
  Smartphone,
  MessageCircle,
  ChevronRight,
  Star,
  MapPin,
  Phone,
  Mail,
  Check,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';
import { t, isRTL } from '@/lib/i18n';
import Header from './Header';
import Footer from './Footer';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

function AnimatedSection({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={staggerContainer}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Feature data
const features = [
  { key: 'income', icon: DollarSign, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  { key: 'expense', icon: CreditCard, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  { key: 'invoice', icon: FileText, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-900/20' },
  { key: 'bookings', icon: Calendar, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/20' },
  { key: 'workOrders', icon: Wrench, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-900/20' },
  { key: 'reports', icon: BarChart3, color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-900/20' },
  { key: 'security', icon: Shield, color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-slate-800/50' },
  { key: 'multilingual', icon: Globe, color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-900/20' },
  { key: 'pwa', icon: Smartphone, color: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-50 dark:bg-pink-900/20' },
  { key: 'support', icon: MessageCircle, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20' },
];

// Testimonials data
const testimonials = [
  {
    quote: 'IBS-Pro transformed our workshop operations. The invoicing and work order system saved us hours every week.',
    name: 'Mikko Virtanen',
    company: 'Autohuolto Pro Oy',
    avatar: 'MV',
  },
  {
    quote: 'The multi-language support and professional interface made it easy for our international team to adopt immediately.',
    name: 'Sarah Eriksson',
    company: 'Nordic Auto Service',
    avatar: 'SE',
  },
  {
    quote: 'Best business management tool we\'ve used. The maintenance certificate system is exactly what we needed.',
    name: 'Hassan Al-Rashid',
    company: 'Gulf Automotive',
    avatar: 'HA',
  },
];

// Floating shapes for hero background
function FloatingShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-20 left-[10%] w-20 h-20 rounded-2xl bg-emerald-200/30 dark:bg-emerald-800/20 backdrop-blur-sm"
      />
      <motion.div
        animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-40 right-[15%] w-14 h-14 rounded-full bg-amber-200/30 dark:bg-amber-800/20 backdrop-blur-sm"
      />
      <motion.div
        animate={{ y: [0, -10, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-32 left-[20%] w-16 h-16 rounded-xl bg-teal-200/30 dark:bg-teal-800/20 backdrop-blur-sm"
      />
      <motion.div
        animate={{ y: [0, 12, 0], rotate: [0, -8, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-60 left-[60%] w-10 h-10 rounded-lg bg-rose-200/20 dark:bg-rose-800/10 backdrop-blur-sm"
      />
      <motion.div
        animate={{ y: [0, -15, 0], rotate: [0, 6, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-20 right-[25%] w-24 h-24 rounded-3xl bg-cyan-200/20 dark:bg-cyan-800/10 backdrop-blur-sm"
      />
    </div>
  );
}

export default function LandingPage() {
  const { locale, setPage } = useAppStore();
  const rtl = isRTL(locale);

  // Section refs
  const heroRef = useRef<HTMLElement>(null);
  const featuresRef = useRef<HTMLElement>(null);
  const pricingRef = useRef<HTMLElement>(null);
  const testimonialsRef = useRef<HTMLElement>(null);
  const contactRef = useRef<HTMLElement>(null);

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [sent, setSent] = useState(false);

  // Navigate to section
  const scrollToSection = (section: string) => {
    const refs: Record<string, React.RefObject<HTMLElement | null>> = {
      hero: heroRef,
      features: featuresRef,
      pricing: pricingRef,
      testimonials: testimonialsRef,
      contact: contactRef,
    };
    const ref = refs[section];
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Scroll hero into view on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => {
      setContactName('');
      setContactEmail('');
      setContactMessage('');
      setSent(false);
    }, 3000);
  };

  return (
    <div dir={rtl ? 'rtl' : 'ltr'} className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header onNavigate={scrollToSection} />

      {/* ==================== HERO SECTION ==================== */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16"
      >
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/30" />

        {/* Large decorative gradient orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] md:w-[800px] md:h-[800px] rounded-full bg-gradient-to-br from-emerald-200/40 via-teal-100/30 to-cyan-200/20 dark:from-emerald-900/20 dark:via-teal-900/10 dark:to-cyan-900/10 blur-3xl" />

        <FloatingShapes />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge
                variant="secondary"
                className="mb-6 px-4 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 text-sm font-medium"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                {t('features.title', locale)}
              </Badge>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6"
            >
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 dark:from-emerald-400 dark:via-teal-400 dark:to-emerald-400 bg-clip-text text-transparent">
                {t('hero.title', locale)}
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              {t('hero.subtitle', locale)}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button
                size="lg"
                onClick={() => setPage('register')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40 transition-all duration-300 px-8 py-6 text-lg group"
              >
                {t('hero.cta', locale)}
                <ArrowRight className={`w-5 h-5 ml-2 transition-transform group-hover:translate-x-1 ${rtl ? 'rotate-180 ml-0 mr-2' : ''}`} />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => scrollToSection('features')}
                className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 px-8 py-6 text-lg"
              >
                {t('hero.learnMore', locale)}
                <ChevronRight className={`w-5 h-5 ml-1 ${rtl ? 'rotate-180 ml-0 mr-1' : ''}`} />
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto"
            >
              {[
                { value: '500+', label: locale === 'ar' ? 'شركة' : 'Companies' },
                { value: '99.9%', label: locale === 'ar' ? 'وقت التشغيل' : 'Uptime' },
                { value: '24/7', label: locale === 'ar' ? 'الدعم' : 'Support' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ==================== FEATURES SECTION ==================== */}
      <section
        ref={featuresRef}
        className="py-20 md:py-28 bg-white dark:bg-slate-950"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <motion.div variants={fadeInUp} className="mb-4">
              <Badge variant="secondary" className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
                Features
              </Badge>
            </motion.div>
            <motion.h2
              variants={fadeInUp}
              className="text-3xl sm:text-4xl font-bold mb-4"
            >
              {t('features.title', locale)}
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto"
            >
              {t('features.subtitle', locale)}
            </motion.p>
          </AnimatedSection>

          <AnimatedSection>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
              {features.map((feature) => {
                const Icon = feature.icon;
                const featureKey = feature.key === 'support' ? 'features.pwa' : `features.${feature.key}`;
                const descKey = feature.key === 'support' ? 'features.pwaDesc' : `features.${feature.key}Desc`;

                return (
                  <motion.div key={feature.key} variants={fadeInUp}>
                    <Card className="group h-full hover:shadow-lg hover:border-emerald-200 dark:hover:border-emerald-800/50 transition-all duration-300 cursor-default bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                      <CardContent className="p-4 md:p-6 flex flex-col items-center text-center gap-3">
                        <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className={`w-6 h-6 ${feature.color}`} />
                        </div>
                        <h3 className="font-semibold text-sm md:text-base text-slate-900 dark:text-white">
                          {t(featureKey, locale)}
                        </h3>
                        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                          {t(descKey, locale)}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ==================== PRICING SECTION ==================== */}
      <section
        ref={pricingRef}
        className="py-20 md:py-28 bg-slate-50 dark:bg-slate-900/30"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <motion.div variants={fadeInUp} className="mb-4">
              <Badge variant="secondary" className="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
                <Zap className="w-3.5 h-3.5 mr-1.5" />
                Pricing
              </Badge>
            </motion.div>
            <motion.h2
              variants={fadeInUp}
              className="text-3xl sm:text-4xl font-bold mb-4"
            >
              {t('pricing.title', locale)}
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto"
            >
              {t('pricing.subtitle', locale)}
            </motion.p>
          </AnimatedSection>

          <AnimatedSection>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-3xl mx-auto">
              {/* Monthly Plan */}
              <motion.div variants={fadeInUp}>
                <Card className="h-full border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300 bg-white dark:bg-slate-900">
                  <CardContent className="p-6 md:p-8">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                        {t('pricing.month', locale)}
                      </h3>
                      <div className="flex items-baseline justify-center gap-1 mb-6">
                        <span className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">
                          €40
                        </span>
                        <span className="text-slate-500 dark:text-slate-400">
                          {t('pricing.monthly', locale)}
                        </span>
                      </div>
                      <ul className="space-y-3 text-left mb-8">
                        {[
                          t('features.title', locale),
                          t('nav.testimonials', locale),
                          t('features.multilingual', locale),
                          t('features.pwa', locale),
                        ].map((item) => (
                          <li key={item} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                            <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                      <Button
                        variant="outline"
                        className="w-full border-slate-300 dark:border-slate-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all"
                        onClick={() => setPage('register')}
                      >
                        {t('pricing.getStarted', locale)}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Yearly Plan */}
              <motion.div variants={fadeInUp}>
                <Card className="relative h-full border-emerald-300 dark:border-emerald-700 shadow-lg shadow-emerald-600/10 transition-all duration-300 bg-white dark:bg-slate-900 overflow-visible">
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white border-0 px-3 py-1 text-xs font-semibold shadow-sm">
                    {t('pricing.save', locale)}
                  </Badge>
                  <CardContent className="p-6 md:p-8">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                        {t('pricing.year', locale)}
                      </h3>
                      <div className="flex items-baseline justify-center gap-1 mb-1">
                        <span className="text-4xl md:text-5xl font-bold text-emerald-600 dark:text-emerald-400">
                          €360
                        </span>
                        <span className="text-slate-500 dark:text-slate-400">
                          {t('pricing.yearly', locale)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                        €30/month
                      </p>
                      <ul className="space-y-3 text-left mb-8">
                        {[
                          t('features.title', locale),
                          t('nav.testimonials', locale),
                          t('features.multilingual', locale),
                          t('features.pwa', locale),
                          t('features.security', locale),
                        ].map((item) => (
                          <li key={item} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                            <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                      <Button
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/25 hover:shadow-emerald-600/40 transition-all"
                        onClick={() => setPage('register')}
                      >
                        {t('pricing.getStarted', locale)}
                        <ArrowRight className={`w-4 h-4 ml-1 ${rtl ? 'rotate-180 ml-0 mr-1' : ''}`} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ==================== TESTIMONIALS SECTION ==================== */}
      <section
        ref={testimonialsRef}
        className="py-20 md:py-28 bg-white dark:bg-slate-950"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <motion.div variants={fadeInUp} className="mb-4">
              <Badge variant="secondary" className="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
                <Star className="w-3.5 h-3.5 mr-1.5" />
                Testimonials
              </Badge>
            </motion.div>
            <motion.h2
              variants={fadeInUp}
              className="text-3xl sm:text-4xl font-bold mb-4"
            >
              {t('testimonials.title', locale)}
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto"
            >
              {t('testimonials.subtitle', locale)}
            </motion.p>
          </AnimatedSection>

          <AnimatedSection>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {testimonials.map((item, idx) => (
                <motion.div key={idx} variants={fadeInUp}>
                  <Card className="h-full hover:shadow-lg transition-all duration-300 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <CardContent className="p-6">
                      {/* Stars */}
                      <div className="flex gap-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-4 h-4 fill-amber-400 text-amber-400"
                          />
                        ))}
                      </div>
                      {/* Quote */}
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6 text-sm md:text-base">
                        &ldquo;{item.quote}&rdquo;
                      </p>
                      {/* Author */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                          <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                            {item.avatar}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-slate-900 dark:text-white">
                            {item.name}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {item.company}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ==================== CONTACT SECTION ==================== */}
      <section
        ref={contactRef}
        className="py-20 md:py-28 bg-slate-50 dark:bg-slate-900/30"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <motion.h2
              variants={fadeInUp}
              className="text-3xl sm:text-4xl font-bold mb-4"
            >
              {t('contact.title', locale)}
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto"
            >
              {t('contact.subtitle', locale)}
            </motion.p>
          </AnimatedSection>

          <AnimatedSection>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 max-w-5xl mx-auto">
              {/* Contact Form */}
              <motion.div variants={fadeInUp}>
                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                  <CardContent className="p-6 md:p-8">
                    {sent ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-12"
                      >
                        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
                          <Check className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                          {t('contact.success', locale)}
                        </p>
                      </motion.div>
                    ) : (
                      <form onSubmit={handleContactSubmit} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            {t('contact.name', locale)}
                          </label>
                          <Input
                            value={contactName}
                            onChange={(e) => setContactName(e.target.value)}
                            placeholder={t('contact.name', locale)}
                            required
                            className="border-slate-300 dark:border-slate-600"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            {t('contact.email', locale)}
                          </label>
                          <Input
                            type="email"
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            placeholder={t('contact.email', locale)}
                            required
                            className="border-slate-300 dark:border-slate-600"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            {t('contact.message', locale)}
                          </label>
                          <Textarea
                            value={contactMessage}
                            onChange={(e) => setContactMessage(e.target.value)}
                            placeholder={t('contact.message', locale)}
                            rows={4}
                            required
                            className="border-slate-300 dark:border-slate-600 resize-none"
                          />
                        </div>
                        <Button
                          type="submit"
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                        >
                          {t('contact.send', locale)}
                          <ArrowRight className={`w-4 h-4 ml-2 ${rtl ? 'rotate-180 ml-0 mr-2' : ''}`} />
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Contact Info */}
              <motion.div variants={fadeInUp} className="space-y-6">
                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-1">
                        {t('contact.address', locale)}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Business Center Helsinki<br />
                        Mannerheimintie 20<br />
                        00100 Helsinki, Finland
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-1">
                        {t('contact.phone', locale)}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        +358 9 123 4567
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-1">
                        {t('contact.emailLabel', locale)}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        info@ibs-pro.fi
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* CTA Card */}
                <Card className="bg-gradient-to-br from-emerald-600 to-teal-600 border-0 shadow-lg shadow-emerald-600/20">
                  <CardContent className="p-6 text-center text-white">
                    <h3 className="font-bold text-lg mb-2">
                      {t('hero.cta', locale)}
                    </h3>
                    <p className="text-emerald-100 text-sm mb-4">
                      {t('hero.subtitle', locale)}
                    </p>
                    <Button
                      variant="secondary"
                      onClick={() => setPage('register')}
                      className="bg-white text-emerald-700 hover:bg-emerald-50 font-semibold shadow-sm"
                    >
                      {t('pricing.getStarted', locale)}
                      <ArrowRight className={`w-4 h-4 ml-1 ${rtl ? 'rotate-180 ml-0 mr-1' : ''}`} />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <Footer />
    </div>
  );
}
