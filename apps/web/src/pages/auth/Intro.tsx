import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Phone, Leaf, Flame, Droplet, Calendar, Users, Shield,
  ArrowRight, CheckCircle, Activity, Heart, Clock
} from "lucide-react";
import { Button } from '../../components/ui/Button';

const Intro: React.FC = () => {
  const navigate = useNavigate();
  // ... (keep existing hooks)
  const { t, i18n } = useTranslation("common");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang).catch(() => { });
    try {
      localStorage.setItem("ayurtribe_lang", lang);
    } catch { }
  };

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
                {t("common.appName", "Ayur Tribe")}
              </div>
              <div className="text-xs font-medium text-emerald-700 tracking-wide uppercase mt-0.5">
                {t("hero.subtitle", "Ayurveda & Wellness")}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <select
                id="lang"
                value={i18n.language || "en"}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="appearance-none pl-4 pr-8 py-2 bg-stone-100 hover:bg-stone-200 border-none rounded-full text-sm font-medium text-stone-700 cursor-pointer focus:ring-2 focus:ring-emerald-500 transition-colors outline-none"
                aria-label={t("common.appName")}
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी</option>
                <option value="kn">ಕನ್ನಡ</option>
                <option value="ta">தமிழ்</option>
                <option value="te">తెలుగు</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-stone-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>

            <Button
              variant="ghost"
              onClick={() => navigate("/auth/login")}
              className="rounded-full"
            >
              Log In
            </Button>

            <Button
              variant="primary"
              onClick={() => navigate("/auth/register")}
              className="hidden sm:inline-flex rounded-full shadow-lg shadow-emerald-200 hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              Get Started
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
                  New Generational Health
                </div>

                <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-stone-900 leading-[1.1]">
                  Holistic Health, <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-teal-700">
                    Defined by Nature.
                  </span>
                </h1>

                <p className="text-xl text-stone-600 leading-relaxed max-w-lg">
                  {t("hero.description", "Experience the perfect synergy of ancient Ayurvedic wisdom and modern medical science. Personalized care, simplified.")}
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
                      {t("cta.register", "Start Your Journey")}
                    </Button>
                  </div>

                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                    className="w-full sm:w-auto"
                  >
                    Learn More
                  </Button>
                </div>

                <div className="flex items-center gap-6 pt-4 text-sm font-medium text-stone-500">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    <span>Free Prakriti Analysis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    <span>Expert Guidance</span>
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
                      <h3 className="text-2xl font-bold text-stone-900">{t("phoneEntry.title", "Get Started")}</h3>
                      <p className="text-stone-500">{t("phoneEntry.subtitle", "Join thousands on their journey")}</p>
                    </div>

                    <div className="space-y-4">

                      <Button
                        variant="secondary"
                        size="lg"
                        className="w-full justify-center group"
                        onClick={() => navigate("/auth/register")}
                        rightIcon={<ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />}
                      >
                        Create Account
                      </Button>

                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full justify-center bg-white hover:bg-stone-50"
                        onClick={() => navigate("/auth/login")}
                      >
                        Sign In
                      </Button>
                    </div>

                    <div className="text-center pt-2">
                      <p className="text-xs text-stone-400">
                        By continuing, you agree to our <a href="#" className="underline hover:text-emerald-700">Terms</a> & <a href="#" className="underline hover:text-emerald-700">Privacy Policy</a>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Floating Elements around the card */}
                <div className="absolute -right-4 top-20 bg-white p-4 rounded-2xl shadow-xl border border-stone-100 flex items-center gap-3 animate-float delay-100 hidden sm:flex">
                  <div className="bg-amber-100 p-2 rounded-full text-amber-600"><Flame className="w-5 h-5" /></div>
                  <div>
                    <div className="text-xs text-stone-500 font-medium">Prakriti</div>
                    <div className="text-sm font-bold text-stone-800">Pitta Dominant</div>
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
              <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4">Complete Health Management</h2>
              <p className="text-lg text-stone-600">
                Everything you need to manage your health journey, from simplified scheduling to deep Ayurvedic insights.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                icon={Users}
                title={t("features.prakriti", "Prakriti Analysis")}
                desc="Discover your unique body constitution through our advanced AI-driven questionnaire."
                color="bg-amber-50 text-amber-700"
              />
              <FeatureCard
                icon={Calendar}
                title={t("features.scheduling", "Smart Scheduling")}
                desc="Book appointments seamlessly with top practitioners based on your availability."
                color="bg-emerald-50 text-emerald-700"
              />
              <FeatureCard
                icon={Shield}
                title="Secure & Private"
                desc="Your health data is encrypted and protected with enterprise-grade security."
                color="bg-blue-50 text-blue-700"
              />
              <FeatureCard
                icon={Activity}
                title="Health Tracking"
                desc="Monitor your vitals, sleep, and nutrition progress over time with intuitive charts."
                color="bg-purple-50 text-purple-700"
              />
              <FeatureCard
                icon={Heart}
                title="Personalized Care"
                desc="Get diet and lifestyle recommendations tailored specifically to your Prakriti."
                color="bg-rose-50 text-rose-700"
              />
              <FeatureCard
                icon={Clock}
                title="24/7 Support"
                desc="Access automated support and resources whenever you need them, day or night."
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
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-amber-50">Unlock Your Ayurvedic Profile</h2>
                <p className="text-emerald-100 text-lg mb-8 leading-relaxed">
                  Understanding your Prakriti (Dosha) is the key to balanced health. Our platform analyzes your physical and mental traits to provide a comprehensive profile.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-emerald-800/50 rounded-xl border border-emerald-700/50 hover:bg-emerald-800 transition-colors">
                    <div className="bg-white/10 p-3 rounded-lg"><Leaf className="w-6 h-6 text-emerald-300" /></div>
                    <div>
                      <h4 className="font-semibold text-lg text-amber-100">Personalized Diet Plans</h4>
                      <p className="text-sm text-emerald-200">Foods that balance your specific Dosha.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-emerald-800/50 rounded-xl border border-emerald-700/50 hover:bg-emerald-800 transition-colors">
                    <div className="bg-white/10 p-3 rounded-lg"><Activity className="w-6 h-6 text-emerald-300" /></div>
                    <div>
                      <h4 className="font-semibold text-lg text-amber-100">Lifestyle Adjustments</h4>
                      <p className="text-sm text-emerald-200">Routines synchronized with your body clock.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-5">
                <PrakritiCard
                  icon={Leaf}
                  name={t("prakriti.vata.name", "Vata")}
                  desc="Air & Ether. Characteristics of movement, creativity, and energy."
                  theme="text-sky-300 bg-sky-900/30 border-sky-800"
                />
                <PrakritiCard
                  icon={Flame}
                  name={t("prakriti.pitta.name", "Pitta")}
                  desc="Fire's intensity. Associated with metabolism, digestion, and focus."
                  theme="text-amber-300 bg-amber-900/40 border-amber-700"
                />
                <PrakritiCard
                  icon={Droplet}
                  name={t("prakriti.kapha.name", "Kapha")}
                  desc="Earth & Water. Embodying strength, stability, and endurance."
                  theme="text-emerald-300 bg-emerald-950/40 border-emerald-800"
                />
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-stone-50">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-stone-900 mb-6">Ready to Transform Your Health?</h2>
            <p className="text-lg text-stone-600 mb-10">
              Join thousands of others who are rediscovering wellness through the power of Ayurveda.
            </p>
            <Button
              size="lg"
              onClick={() => navigate("/auth/register")}
              className="px-10 py-4 rounded-full font-bold text-lg shadow-xl shadow-emerald-200 hover:shadow-2xl hover:-translate-y-1 transition-all"
            >
              Get Started for Free
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
                <span className="font-bold text-lg text-stone-900">Ayur Tribe</span>
              </div>
              <p className="text-sm text-stone-500">
                Integrating ancient wisdom with modern healthcare technology.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-stone-900 mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-stone-600">
                <li><a href="#" className="hover:text-emerald-700">Home</a></li>
                <li><a href="#" className="hover:text-emerald-700">Features</a></li>
                <li><a href="#" className="hover:text-emerald-700">Practitioners</a></li>
                <li><a href="#" className="hover:text-emerald-700">Pricing</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-stone-900 mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-stone-600">
                <li><a href="#" className="hover:text-emerald-700">Blog</a></li>
                <li><a href="#" className="hover:text-emerald-700">Knowledge Base</a></li>
                <li><a href="#" className="hover:text-emerald-700">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-emerald-700">Terms of Service</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-stone-900 mb-4">Contact</h4>
              <p className="text-sm text-stone-600 mb-2">support@ayurtribe.com</p>
              <p className="text-sm text-stone-600">1-800-AYURVEDA</p>
            </div>
          </div>

          <div className="border-t border-stone-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-stone-500">
              © {new Date().getFullYear()} Ayur Tribe. All rights reserved.
            </div>
            <div className="flex gap-6">
              <button onClick={() => navigate("/auth/login")} className="text-sm font-medium text-stone-500 hover:text-emerald-700 transition-colors">
                Practitioner Login
              </button>
              <button onClick={() => navigate("/auth/login")} className="text-sm font-medium text-stone-500 hover:text-emerald-700 transition-colors">
                Admin Login
              </button>
            </div>
          </div>
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
