import React from 'react';
import { Sparkles, Utensils, Heart, Coffee } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getAssetUrl } from '../data/embeddedAssets';

export const StorySection: React.FC = () => {
  const { t, isArabic } = useLanguage();

  return (
    <section id="story" className="py-12 sm:py-20 bg-white dark:bg-stone-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        
        {/* Image Grid Side: 6 Pakistani Heritage Images */}
        <div className="lg:col-span-6 grid grid-cols-2 gap-3 sm:gap-4 order-2 lg:order-1">
          <div className="space-y-3 sm:space-y-4">
            <img
              src={getAssetUrl('image_30fad4d6.png')}
              alt="Faisal Mosque Architecture"
              className="w-full h-40 sm:h-56 object-cover rounded-2xl shadow-lg border border-stone-200 dark:border-stone-800"
            />
            <img
              src={getAssetUrl('image_270cff7b.png')}
              alt="Historic Food Street Heritage"
              className="w-full h-36 sm:h-44 object-cover rounded-2xl shadow-lg border border-stone-200 dark:border-stone-800"
            />
            <img
              src={getAssetUrl('image_ed5697ca.png')}
              alt="Pakistani Landscapes & Culinary Gatherings"
              className="w-full h-40 sm:h-52 object-cover rounded-2xl shadow-lg border border-stone-200 dark:border-stone-800"
            />
          </div>
          <div className="space-y-3 sm:space-y-4 pt-4 sm:pt-6">
            <img
              src={getAssetUrl('image_20e297ba.png')}
              alt="Golden Hour River & Mountain Valley"
              className="w-full h-36 sm:h-44 object-cover rounded-2xl shadow-lg border border-stone-200 dark:border-stone-800"
            />
            <img
              src={getAssetUrl('image_4e4fabd8.png')}
              alt="Northern Peaks & Green Meadows"
              className="w-full h-40 sm:h-56 object-cover rounded-2xl shadow-lg border border-stone-200 dark:border-stone-800"
            />
            <img
              src={getAssetUrl('image_9f8e31ac.png')}
              alt="Historic Forts & Architectural Monuments"
              className="w-full h-40 sm:h-52 object-cover rounded-2xl shadow-lg border border-stone-200 dark:border-stone-800"
            />
          </div>
        </div>

        {/* Text Story Side */}
        <div className={`lg:col-span-6 space-y-5 sm:space-y-6 order-1 lg:order-2 ${isArabic ? 'text-right' : 'text-left'}`}>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 rounded-full text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('Our Story & Pakistani Heritage · قصة سفرة راوي')}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            {t('The Rich Flavors & Hospitality of Pakistan')}
          </h2>

          <p className="text-stone-600 dark:text-stone-400 leading-relaxed text-sm sm:text-base">
            {t('Sufrah Ravi (سفرة راوي) draws its name and authentic soul from the rich culinary traditions and boundless hospitality of Pakistan. Our dishes carry the genuine, time-honored taste of the subcontinent, where every gathering around a shared table ("Sufrah") celebrates timeless food stories, warm connections, and the vibrant heritage of Pakistan.')}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="bg-stone-50 dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-1">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-sm">
                <Utensils className="w-4 h-4 shrink-0" />
                <span>{t('Traditional Pakistani Nashta')}</span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {t('Flaky tawa parathas and spiced channay made with authentic Pakistani recipes.')}
              </p>
            </div>

            <div className="bg-stone-50 dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-1">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-sm">
                <Coffee className="w-4 h-4 shrink-0" />
                <span>{t('Karak Doodh Patti')}</span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {t('Slow-boiled aromatic cardamom tea brewed the authentic Pakistani way.')}
              </p>
            </div>
          </div>

          <div className="pt-2 sm:pt-4 flex items-center gap-4 text-stone-500 text-sm">
            <div className="flex items-center gap-1.5 font-semibold text-stone-900 dark:text-stone-100">
              <Heart className="w-4 h-4 text-amber-600 fill-amber-600 shrink-0" />
              <span>{t('Authentic Taste from Pakistan')}</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
