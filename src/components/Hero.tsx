import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Utensils, Flame, Clock, MapPin, Sparkles } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface HeroProps {
  onStartOrder: () => void;
  onExploreStory: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartOrder, onExploreStory }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [animKey, setAnimKey] = useState(0);
  const wasInViewRef = useRef(true);
  const { language, t } = useLanguage();

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !wasInViewRef.current) {
          wasInViewRef.current = true;
          setAnimKey((prev) => prev + 1);
        } else if (!entry.isIntersecting && entry.intersectionRatio < 0.1) {
          wasInViewRef.current = false;
        }
      },
      { threshold: [0.05, 0.35] }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const words =
    language === 'ar'
      ? [
          {
            text: 'سفرة',
            initialRotate: -28,
            tiltSequence: [-28, 14, -8, 4, 0],
            delay: 0.05,
            className: 'text-amber-500 font-bold text-4xl sm:text-6xl lg:text-7xl tracking-tight',
          },
          {
            text: 'راوي',
            initialRotate: 26,
            tiltSequence: [26, -15, 9, -4, 0],
            delay: 0.28,
            className: 'text-amber-500 font-bold text-4xl sm:text-6xl lg:text-7xl tracking-tight',
          },
        ]
      : [
          {
            text: 'Sufrah',
            initialRotate: -28,
            tiltSequence: [-28, 14, -8, 4, 0],
            delay: 0.05,
            className: 'text-amber-500 font-bold text-4xl sm:text-6xl lg:text-7xl tracking-tight',
          },
          {
            text: 'Ravi',
            initialRotate: 26,
            tiltSequence: [26, -15, 9, -4, 0],
            delay: 0.28,
            className: 'text-amber-500 font-bold text-4xl sm:text-6xl lg:text-7xl tracking-tight',
          },
          {
            text: 'سفرة راوي',
            initialRotate: -18,
            tiltSequence: [-18, 10, -5, 2, 0],
            delay: 0.52,
            className: 'text-stone-300 font-normal text-2xl sm:text-4xl lg:text-5xl ml-1 sm:ml-2',
          },
        ];

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-stone-950 text-white py-14 sm:py-20 lg:py-28"
    >
      {/* Background Image with Scrim */}
      <div className="absolute inset-0 z-0 opacity-40 mix-blend-luminosity">
        <img
          src="/public/assets/aistudio/WhatsApp_Image_2026-11-04_at_9.49.37_AM_ae8be6bc.jpeg"
          alt="Sufrah Ravi Storefront"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/80 to-stone-950/40" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        
        {/* Left Column: Headline & CTAs */}
        <div className="lg:col-span-7 space-y-5 sm:space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-900/60 border border-amber-700/50 rounded-full text-[11px] sm:text-xs font-medium text-amber-200 max-w-full">
            <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">
              {t('Authentic Taste from Pakistan · المذاق الأصيل من باكستان')}
            </span>
          </div>

          <div className="space-y-1">
            <p className="text-base sm:text-xl font-medium text-stone-400 tracking-widest uppercase">
              {t('Welcome to')}
            </p>
            <h1
              key={`${animKey}-${language}`}
              className="flex flex-wrap items-baseline gap-x-3 sm:gap-x-4 gap-y-2 py-2 overflow-visible"
            >
              {words.map((item, idx) => (
                <motion.span
                  key={`${animKey}-${language}-${idx}`}
                  initial={{
                    y: -160,
                    opacity: 0,
                    rotate: item.initialRotate,
                    scale: 0.9,
                  }}
                  animate={{
                    y: [-160, 0, -28, 0, -10, 0],
                    opacity: [0, 1, 1, 1, 1, 1],
                    rotate: item.tiltSequence,
                    scale: [0.9, 1.04, 0.98, 1.01, 1, 1],
                  }}
                  transition={{
                    duration: 0.95,
                    delay: item.delay,
                    times: [0, 0.42, 0.62, 0.78, 0.9, 1],
                    ease: 'easeOut',
                  }}
                  className={`inline-block origin-bottom ${item.className}`}
                >
                  {item.text}
                </motion.span>
              ))}
            </h1>
          </div>

          <p className="text-base sm:text-xl text-stone-300 max-w-xl leading-relaxed pt-1">
            {t(
              'Experience the legendary homestyle flavors inspired by the culinary heritage of Pakistan. From freshly made tawa rotis and golden crispy anda parathas to slow-simmered chicken qorma and fragrant karak chai.'
            )}
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-3">
            <button
              onClick={onStartOrder}
              className="flex items-center justify-center gap-2 px-7 py-3.5 sm:py-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 text-sm sm:text-base"
            >
              <Utensils className="w-5 h-5" />
              <span>{t('Order Online Now')}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </button>

            <button
              onClick={onExploreStory}
              className="px-7 py-3.5 sm:py-4 bg-stone-900/80 hover:bg-stone-800 text-stone-200 font-medium rounded-xl border border-stone-800 transition-colors text-sm sm:text-base text-center"
            >
              {t('Our Heritage & Story')}
            </button>
          </div>

          {/* Quick info strip */}
          <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-8 sm:pt-10 border-t border-stone-800/80 text-stone-300">
            <div>
              <div className="flex items-center gap-1.5 text-amber-400 text-[11px] sm:text-xs font-semibold uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>{t('Hours')}</span>
              </div>
              <p className="text-xs sm:text-sm font-medium mt-1">
                {t('6:00 AM – 11:30 PM')}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-amber-400 text-[11px] sm:text-xs font-semibold uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span>{t('Heritage')}</span>
              </div>
              <p className="text-xs sm:text-sm font-medium mt-1">{t('Pakistan')}</p>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-amber-400 text-[11px] sm:text-xs font-semibold uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5 shrink-0" />
                <span>{t('Specialty')}</span>
              </div>
              <p className="text-xs sm:text-sm font-medium mt-1">
                {t('Fresh Tawa & Qorma')}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: User Uploaded Dish Preview Card */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative bg-stone-900/90 border border-stone-800 p-3.5 sm:p-4 rounded-3xl shadow-2xl backdrop-blur-md lg:transform lg:rotate-1 lg:hover:rotate-0 transition-transform duration-500 max-w-sm w-full space-y-3">
            <div className="relative h-60 sm:h-72 rounded-2xl overflow-hidden bg-stone-950">
              <img
                src="/public/assets/aistudio/Gemini_Generated_Image_l5z3wsl5z3wsl5z3_7acef4d2.jpg"
                alt="Sufrah Ravi Signature Dishes"
                className="w-full h-full object-cover object-[center_15%]"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <span className="text-[11px] font-bold bg-amber-600 px-2.5 py-1 rounded-full uppercase tracking-wider shadow">
                  {t('Freshly Prepared Daily')}
                </span>
                <h4 className="text-base font-bold mt-1">
                  {t('Nashta, Qorma & Karak Chai')}
                </h4>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-stone-400 px-2 pb-1">
              <div className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{t('Freshly Prepared Daily')}</span>
              </div>
              <span className="text-amber-400 font-bold">{t('100% Homestyle')}</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
