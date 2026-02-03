import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from '../../context/LanguageContext';
import { LanguageSelector } from '../../components/LanguageSelector';
import {
  Phone, Leaf, Flame, Droplet, Calendar, Users, Shield,
  ArrowRight, CheckCircle, Activity, Heart, Clock
} from "lucide-react";
import { Button } from '../../components/ui/Button';
import { GlobalFooter } from '../../components/GlobalFooter';

const Intro: React.FC = () => {
  const navigate = useNavigate();
  // ... (keep existing hooks)
  const { t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-800 selection:bg-emerald-100 dark:selection:bg-emerald-900">

      {/* Sticky Glass Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${scrolled
          ? "bg-white/80 backdrop-blur-md border-stone-200 shadow-sm py-3"
          : "bg-transparent border-transparent py-5"
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate("/")}>
            <div className="h-10 w-10 rounded-xl bg-[#1a4731] flex items-center justify-center shadow-lg shadow-emerald-200 transform transition-transform group-hover:scale-105 border border-emerald-600 p-1">
              <img src="/ayurtribelogo.png" alt="Ayur Tribe" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="text-xl font-bold tracking-tight text-stone-900 leading-none">
                {t("app_name")}
              </div>
              <div className="text-xs font-medium text-emerald-700 tracking-wide uppercase mt-0.5">
                {t("subtitle")}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <LanguageSelector />
            </div>

            <Button
              variant="ghost"
              onClick={() => navigate("/auth/login")}
              className="rounded-full"
            >
              {t('Log In')}
            </Button>

            <Button
              variant="primary"
              onClick={() => navigate("/auth/register")}
              className="hidden sm:inline-flex rounded-full shadow-lg shadow-emerald-200 hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              {t('Get Started')}
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
          {/* Background Decorative Elements */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-emerald-50/50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[500px] h-[500px] bg-amber-50/50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">

              {/* Left Column: Text */}
              <div className="space-y-8 animate-fade-in-up">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/50 border border-emerald-200 text-emerald-800 text-xs font-semibold uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                  {t('landing.hero_tag')}
                </div>

                <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-stone-900 leading-[1.1]">
                  {t('landing.hero_title_1')} <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-teal-700">
                    {t('landing.hero_title_2')}
                  </span>
                </h1>

                <p className="text-xl text-stone-600 leading-relaxed max-w-lg">
                  {t('landing.hero_desc')}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <div className="relative group w-full sm:w-auto">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg blur opacity-30 group-hover:opacity-70 transition duration-200"></div>
                    <Button
                      size="lg"
                      onClick={() => navigate("/auth/register")}
                      className="relative w-full sm:w-auto justify-center shadow-lg"
                      rightIcon={<ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                    >
                      {t('landing.cta_primary')}
                    </Button>
                  </div>

                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                    className="w-full sm:w-auto"
                  >
                    {t('landing.cta_secondary')}
                  </Button>
                </div>

                <div className="flex items-center gap-6 pt-4 text-sm font-medium text-stone-500">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    <span>{t('landing.feature_prakriti')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    <span>{t('landing.feature_scheduling')}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Card */}
              <div className="relative lg:h-[600px] flex items-center justify-center">

                {/* Main Glass Card */}
                <div className="relative w-full max-w-md bg-white/60 backdrop-blur-xl border border-white/60 shadow-2xl rounded-3xl p-8 transform rotate-1 hover:rotate-0 transition-transform duration-500">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-50/30 to-transparent rounded-3xl pointer-events-none"></div>

                  <div className="relative z-10 space-y-6">
                    <div className="space-y-2 text-center pb-4 border-b border-stone-100">
                      <h3 className="text-2xl font-bold text-stone-900">{t('nav.get_started')}</h3>
                      <p className="text-stone-500">{t('landing.hero_tag')}</p>
                    </div>

                    <div className="space-y-4">

                      <Button
                        variant="secondary"
                        size="lg"
                        className="w-full justify-center group"
                        onClick={() => navigate("/auth/register")}
                        rightIcon={<ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />}
                      >
                        {t('auth.create_account')}
                      </Button>

                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full justify-center bg-white hover:bg-stone-50"
                        onClick={() => navigate("/auth/login")}
                      >
                        {t('auth.sign_in')}
                      </Button>
                    </div>

                    <div className="text-center pt-2">
                      <p className="text-xs text-stone-400">
                        {t('auth.continue_agreement')} <a href="#" className="underline hover:text-emerald-700">{t('auth.terms')}</a> & <a href="#" className="underline hover:text-emerald-700">{t('auth.privacy')}</a>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Floating Elements around the card */}
                <div className="absolute -right-4 top-20 bg-white p-4 rounded-2xl shadow-xl border border-stone-100 flex items-center gap-3 animate-float delay-100 hidden sm:flex">
                  <div className="bg-amber-100 p-2 rounded-full text-amber-600"><Flame className="w-5 h-5" /></div>
                  <div>
                    <div className="text-xs text-stone-500 font-medium">{t('prakriti.constitution')}</div>
                    <div className="text-sm font-bold text-stone-800">{t('prakriti.pitta')} {t('prakriti.dominant')}</div>
                  </div>
                </div>

                <div className="absolute -left-8 bottom-32 bg-white p-4 rounded-2xl shadow-xl border border-stone-100 flex items-center gap-3 animate-float delay-300 hidden sm:flex">
                  <div className="bg-emerald-100 p-2 rounded-full text-emerald-700"><Leaf className="w-5 h-5" /></div>
                  <div>
                    <div className="text-xs text-stone-500 font-medium">Wellness Score</div>
                    <div className="text-sm font-bold text-stone-800">Excellent</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-white relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4">{t('landing.hero_title_1')}</h2>
              <p className="text-lg text-stone-600">
                {t('landing.hero_desc')}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                icon={Users}
                title={t("landing.feature_prakriti")}
                desc={t("landing.feature_prakriti_desc")}
                color="bg-amber-50 text-amber-700"
              />
              <FeatureCard
                icon={Calendar}
                title={t("landing.feature_scheduling")}
                desc={t("landing.feature_scheduling_desc")}
                color="bg-emerald-50 text-emerald-700"
              />
              <FeatureCard
                icon={Shield}
                title={t("landing.feature_secure")}
                desc={t("landing.feature_secure_desc")}
                color="bg-blue-50 text-blue-700"
              />
              <FeatureCard
                icon={Activity}
                title={t("dashboard.health_metrics")}
                desc={t("landing.feature_secure_desc")} // Reusing desc for now
                color="bg-purple-50 text-purple-700"
              />
              <FeatureCard
                icon={Heart}
                title={t("landing.feature_personalized")}
                desc={t("landing.feature_personalized_desc")}
                color="bg-rose-50 text-rose-700"
              />
              <FeatureCard
                icon={Clock}
                title={t("landing.feature_support")}
                desc={t("landing.feature_support_desc")}
                color="bg-teal-50 text-teal-700"
              />
            </div>
          </div>
        </section>

        {/* Prakriti Section */}
        <section className="py-24 bg-emerald-900 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-800 rounded-full blur-3xl opacity-30 pointer-events-none -mt-20 -mr-20"></div>

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-amber-50">{t('Unlock Your Ayurvedic Profile')}</h2>
                <p className="text-emerald-100 text-lg mb-8 leading-relaxed">
                  {t('Understanding your Prakriti (Dosha) is the key to balanced health. Our platform analyzes your physical and mental traits to provide a comprehensive profile.')}
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-emerald-800/50 rounded-xl border border-emerald-700/50 hover:bg-emerald-800 transition-colors">
                    <div className="bg-white/10 p-3 rounded-lg"><Leaf className="w-6 h-6 text-emerald-300" /></div>
                    <div>
                      <h4 className="font-semibold text-lg text-amber-100">{t('Personalized Diet Plans')}</h4>
                      <p className="text-sm text-emerald-200">{t('Foods that balance your specific Dosha.')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-emerald-800/50 rounded-xl border border-emerald-700/50 hover:bg-emerald-800 transition-colors">
                    <div className="bg-white/10 p-3 rounded-lg"><Activity className="w-6 h-6 text-emerald-300" /></div>
                    <div>
                      <h4 className="font-semibold text-lg text-amber-100">{t('Lifestyle Adjustments')}</h4>
                      <p className="text-sm text-emerald-200">{t('Routines synchronized with your body clock.')}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-5">
                <PrakritiCard
                  icon={Leaf}
                  name={t("Vata")}
                  desc={t("Air & Ether. Characteristics of movement, creativity, and energy.")}
                  theme="text-sky-300 bg-sky-900/30 border-sky-800"
                />
                <PrakritiCard
                  icon={Flame}
                  name={t("Pitta")}
                  desc={t("Fire's intensity. Associated with metabolism, digestion, and focus.")}
                  theme="text-amber-300 bg-amber-900/40 border-amber-700"
                />
                <PrakritiCard
                  icon={Droplet}
                  name={t("Kapha")}
                  desc={t("Earth & Water. Embodying strength, stability, and endurance.")}
                  theme="text-emerald-300 bg-emerald-950/40 border-emerald-800"
                />
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-stone-50">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-stone-900 mb-6">{t('Ready to Transform Your Health?')}</h2>
            <p className="text-lg text-stone-600 mb-10">
              {t('Join thousands of others who are rediscovering wellness through the power of Ayurveda.')}
            </p>
            <Button
              size="lg"
              onClick={() => navigate("/auth/register")}
              className="px-10 py-4 rounded-full font-bold text-lg shadow-xl shadow-emerald-200 hover:shadow-2xl hover:-translate-y-1 transition-all"
            >
              {t('Get Started for Free')}
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-100 py-12">

        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <img src="/ayurtribelogo.png" alt="Ayur Tribe" className="h-10 w-10 p-1 rounded-lg bg-[#1a4731] object-contain" />
                <span className="font-bold text-lg text-stone-900">{t('app_name')}</span>
              </div>
              <p className="text-sm text-stone-500">
                {t('landing.hero_desc')}
              </p>
            </div>

            <div>
              <h4 className="font-bold text-stone-900 mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-stone-600">
                <li><a href="#" className="hover:text-emerald-700">{t("nav.home")}</a></li>
                <li><a href="#" className="hover:text-emerald-700">{t("nav.features")}</a></li>
                <li><a href="#" className="hover:text-emerald-700">{t("nav.practitioners")}</a></li>
                <li><a href="#" className="hover:text-emerald-700">{t("nav.pricing")}</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-stone-900 mb-4">{t("footer.resources")}</h4>
              <ul className="space-y-2 text-sm text-stone-600">
                <li><a href="#" className="hover:text-emerald-700">{t("footer.blog")}</a></li>
                <li><a href="#" className="hover:text-emerald-700">{t("footer.knowledge_base")}</a></li>
                <li><a href="#" className="hover:text-emerald-700">{t("auth.privacy")}</a></li>
                <li><a href="#" className="hover:text-emerald-700">{t("auth.terms")}</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-stone-900 mb-4">{t("footer.contact")}</h4>
              <p className="text-sm text-stone-600 mb-2">support@ayurtribe.com</p>
              <p className="text-sm text-stone-600">1-800-AYURVEDA</p>
            </div>
          </div>

          <div className="border-t border-stone-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-stone-500">
              © {new Date().getFullYear()} {t('app_name')}. {t('landing.footer_rights')}
            </div>
            <div className="flex gap-6">
              <button onClick={() => navigate("/auth/login")} className="text-sm font-medium text-stone-500 hover:text-emerald-700 transition-colors">
                {t('nav.practitioner_login')}
              </button>
              <button onClick={() => navigate("/auth/login")} className="text-sm font-medium text-stone-500 hover:text-emerald-700 transition-colors">
                {t('nav.admin_login')}
              </button>
            </div>
          </div>

          {/* Global Branding */}
          <GlobalFooter className="!py-6 pt-12 border-t border-stone-100 mt-8" />
        </div>
      </footer>
    </div>
  );
};

export default Intro;

/* ------------------ Subcomponents ------------------ */

function FeatureCard({ icon: Icon, title, desc, color }: { icon: any; title: string; desc: string; color: string }) {
  return (
    <div className="p-8 rounded-2xl bg-slate-50 hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-xl transition-all duration-300 group">
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${color} group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed text-sm">{desc}</p>
    </div>
  );
}

function PrakritiCard({ icon: Icon, name, desc, theme }: { icon: any; name: string; desc: string; theme: string }) {
  return (
    <div className={`flex items-start gap-5 p-5 rounded-2xl border ${theme} hover:bg-opacity-40 transition-all cursor-default`}>
      <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
        <Icon className="w-8 h-8" />
      </div>
      <div>
        <h4 className="font-bold text-xl mb-1">{name}</h4>
        <p className="text-sm opacity-90 leading-snug">{desc}</p>
      </div>
    </div>
  );
}
