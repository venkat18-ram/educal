
import React, { useEffect } from 'react';
import { Page } from '../types';
import { Calculator, HelpCircle, GraduationCap, BarChart, CheckCircle, Quote } from 'lucide-react';
import { motion } from 'framer-motion';
import { HeroGeometric } from './ui/shape-landing-hero';


interface LandingPageProps {
  navigate: (page: Page, options?: { scrollTo?: string }) => void;
  scrollTo?: string | null;
  onScrollHandled: () => void;
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  children?: React.ReactNode;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
        duration: 0.5,
        ease: 'easeOut',
    }
  },
};

const FeatureCard = ({ icon, title, children }: FeatureCardProps) => (
    <motion.div variants={itemVariants} className="bg-white/5 p-6 rounded-lg border border-white/10 transform hover:-translate-y-1 transition-transform duration-300">
        <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mb-4">
            {icon}
        </div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="mt-2 text-base text-gray-400">{children}</p>
    </motion.div>
);

const LandingPage: React.FC<LandingPageProps> = ({ navigate, scrollTo, onScrollHandled }) => {
  useEffect(() => {
    if (scrollTo === 'pricing') {
      const element = document.getElementById('pricing-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      onScrollHandled(); // Reset the scroll trigger
    }
  }, [scrollTo, onScrollHandled]);
  
  return (
    <div>
      <HeroGeometric
        badge="Your Learning Co-pilot"
        title1="EduCalc Expert"
        title2="Instant Answers, Expert Help"
        description="From complex calculus to financial forecasting, get instant, step-by-step answers. When calculators aren't enough, our verified experts are here to help."
        cta1Text="Get Instant Answer"
        onCta1Click={() => navigate('ask')}
        cta2Text="Browse Calculators"
        onCta2Click={() => navigate('calculators')}
      />

      <section className="py-20 sm:py-32 bg-[#030303]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={containerVariants}
            className="text-center"
          >
            <motion.h2 variants={itemVariants} className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Everything You Need to Succeed</motion.h2>
            <motion.p variants={itemVariants} className="mt-4 text-lg text-gray-400">A powerful ecosystem for students and professionals.</motion.p>
          </motion.div>
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
            className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4"
           >
            <FeatureCard icon={<Calculator className="h-6 w-6" />} title="60+ Professional Calculators">
              Instant answers with step-by-step solutions for math, science, finance, and more.
            </FeatureCard>
            <FeatureCard icon={<HelpCircle className="h-6 w-6" />} title="Expert Q&A">
              Stuck on a problem? Get detailed explanations from our verified subject-matter experts.
            </FeatureCard>
            <FeatureCard icon={<GraduationCap className="h-6 w-6" />} title="For All Levels">
              Support for learners from K-12, through college (B.Tech), and beyond.
            </FeatureCard>
            <FeatureCard icon={<BarChart className="h-6 w-6" />} title="Personalized Dashboard">
              Track your calculation history, manage questions, and monitor your learning progress.
            </FeatureCard>
          </motion.div>
        </div>
      </section>

      <section className="py-20 sm:py-32 bg-black/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-3 lg:gap-8 lg:items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">How It Works</h2>
                    <p className="mt-4 text-lg text-gray-400">Get answers in three simple steps.</p>
                </div>
                <div className="mt-12 lg:mt-0 lg:col-span-2">
                    <dl className="space-y-10 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-x-6 sm:gap-y-10">
                        <div className="flex">
                            <CheckCircle className="flex-shrink-0 h-6 w-6 text-indigo-400 mr-3" />
                            <div>
                                <dt className="text-lg leading-6 font-medium text-white">1. Choose Your Tool</dt>
                                <dd className="mt-2 text-base text-gray-400">Select from our library of 60+ professional calculators or post a question for our experts.</dd>
                            </div>
                        </div>
                        <div className="flex">
                            <CheckCircle className="flex-shrink-0 h-6 w-6 text-indigo-400 mr-3" />
                            <div>
                                <dt className="text-lg leading-6 font-medium text-white">2. Input Your Problem</dt>
                                <dd className="mt-2 text-base text-gray-400">Enter your equation, data, or query. Get an instant automated solution or submit to an expert.</dd>
                            </div>
                        </div>
                        <div className="flex">
                           <CheckCircle className="flex-shrink-0 h-6 w-6 text-indigo-400 mr-3" />
                            <div>
                                <dt className="text-lg leading-6 font-medium text-white">3. Receive Your Solution</dt>
                                <dd className="mt-2 text-base text-gray-400">Get a detailed, step-by-step answer and understand the concepts behind it.</dd>
                            </div>
                        </div>
                    </dl>
                </div>
            </div>
        </div>
      </section>

      <section id="pricing-section" className="py-20 sm:py-32 bg-black/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={containerVariants}
            className="text-center"
          >
            <motion.h2 variants={itemVariants} className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Flexible Plans for Every Learner</motion.h2>
            <motion.p variants={itemVariants} className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">Choose a subscription for frequent help, or pay as you go for individual questions.</motion.p>
          </motion.div>
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
            className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4"
          >
            {/* Pricing Card 0: Free */}
            <motion.div variants={itemVariants} className="bg-white/5 p-8 rounded-2xl border border-white/10 flex flex-col">
              <h3 className="text-lg font-semibold text-indigo-400">Free</h3>
              <p className="mt-4 text-4xl font-bold text-white">₹0 <span className="text-lg font-medium text-gray-400">/ month</span></p>
              <p className="mt-2 text-gray-400 min-h-[3rem]">For getting started.</p>
              <ul className="mt-8 space-y-4 text-gray-300 flex-grow">
                <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-400" /> 50 Calculator Uses/Month</li>
                <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-400" /> No Expert Questions</li>
                <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-400" /> Basic Support</li>
              </ul>
              <button onClick={() => navigate('login')} className="mt-8 w-full py-3 bg-white/10 border border-white/20 text-white rounded-md font-semibold hover:bg-white/20 transition-all duration-300">Get Started</button>
            </motion.div>

            {/* Pricing Card 1: Plus */}
            <motion.div variants={itemVariants} className="bg-white/5 p-8 rounded-2xl border border-white/10 flex flex-col">
              <h3 className="text-lg font-semibold text-indigo-400">Plus</h3>
              <p className="mt-4 text-4xl font-bold text-white">₹499 <span className="text-lg font-medium text-gray-400">/ month</span></p>
              <p className="mt-2 text-gray-400 min-h-[3rem]">Perfect for occasional help.</p>
              <ul className="mt-8 space-y-4 text-gray-300 flex-grow">
                <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-400" /> 50 Expert Questions/Month</li>
                <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-400" /> Unlimited Calculator Access</li>
                <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-400" /> Priority Support</li>
              </ul>
              <button onClick={() => navigate('login')} className="mt-8 w-full py-3 bg-white/10 border border-white/20 text-white rounded-md font-semibold hover:bg-white/20 transition-all duration-300">Choose Plan</button>
            </motion.div>

            {/* Pricing Card 2: Pro (Highlighted) */}
            <motion.div variants={itemVariants} className="bg-white/5 p-8 rounded-2xl border-2 border-indigo-500 flex flex-col relative overflow-hidden">
               <div className="absolute top-0 right-0 px-4 py-1 bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider rounded-bl-lg">Most Popular</div>
              <h3 className="text-lg font-semibold text-indigo-400">Pro</h3>
              <p className="mt-4 text-4xl font-bold text-white">₹999 <span className="text-lg font-medium text-gray-400">/ month</span></p>
              <p className="mt-2 text-gray-400 min-h-[3rem]">For the dedicated learner.</p>
              <ul className="mt-8 space-y-4 text-gray-300 flex-grow">
                <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-400" /> 200 Expert Questions/Month</li>
                <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-400" /> Unlimited Calculator Access</li>
                <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-400" /> Priority Support</li>
                <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-400" /> Detailed History</li>
              </ul>
              <button onClick={() => navigate('login')} className="mt-8 w-full py-3 bg-indigo-600 text-white rounded-md font-semibold hover:bg-indigo-500 transition-all duration-300 shadow-[0_0_20px_rgba(129,140,248,0.3)]">Choose Plan</button>
            </motion.div>

            {/* Pricing Card 3: Premium */}
            <motion.div variants={itemVariants} className="bg-white/5 p-8 rounded-2xl border border-white/10 flex flex-col">
              <h3 className="text-lg font-semibold text-indigo-400">Premium</h3>
              <p className="mt-4 text-4xl font-bold text-white">₹1499 <span className="text-lg font-medium text-gray-400">/ month</span></p>
              <p className="mt-2 text-gray-400 min-h-[3rem]">For power users and professionals.</p>
              <ul className="mt-8 space-y-4 text-gray-300 flex-grow">
                <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-400" /> Unlimited Expert Questions</li>
                <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-400" /> Unlimited Calculator Access</li>
                <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-400" /> 24/7 Priority Support</li>
                <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-400" /> Detailed History & Analytics</li>
              </ul>
              <button onClick={() => navigate('login')} className="mt-8 w-full py-3 bg-white/10 border border-white/20 text-white rounded-md font-semibold hover:bg-white/20 transition-all duration-300">Choose Plan</button>
            </motion.div>

          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
