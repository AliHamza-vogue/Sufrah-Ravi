import React from 'react';
import { Clock, MapPin, Phone, Mail, Flame } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getAssetUrl } from '../data/embeddedAssets';

export const Footer: React.FC = () => {
  const { t, isArabic } = useLanguage();

  return (
    <footer className="bg-stone-950 text-stone-300 border-t border-stone-800">
      <div className={`max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-12 ${isArabic ? 'text-right' : 'text-left'}`}>
        
        {/* Col 1: Brand */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F5F2EB] border border-amber-600/40 overflow-hidden flex items-center justify-center">
              <img
                src={getAssetUrl('WhatsApp_Image_2026-11-04_at_11.48.52_AM_0c9b2a14.jpeg')}
                alt="Sufrah Ravi Logo"
                className="w-full h-full object-cover rounded-full mix-blend-multiply scale-[2.1] translate-y-2.5 -translate-x-0.5"
              />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-100">{t('Sufrah Ravi')}</h3>
              {!isArabic && (
                <span data-no-translate="true" className="text-xs text-amber-500 font-medium">
                  سفرة راوي
                </span>
              )}
            </div>
          </div>
          <p className="text-xs text-stone-400 leading-relaxed">
            {t('Your authentic destination for homestyle Pakistani comfort food, celebrating the rich culinary heritage of Pakistan. Fresh Tawa Rotis, Morning Nashta, and Karak Chai daily.')}
          </p>
        </div>

        {/* Col 2: Hours */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-stone-100 uppercase tracking-wider">
            {t('Opening Hours')}
          </h4>
          <ul className="space-y-2.5 text-xs text-stone-400">
            <li className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-stone-200 block">{t('Everyday')}</strong>
                <span>{t('6:00 AM – 11:30 PM')}</span>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <Flame className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-stone-200 block">{t('Morning Nashta Special')}</strong>
                <span>{t('6:00 AM – 12:00 PM')}</span>
              </div>
            </li>
          </ul>
        </div>

        {/* Col 3: Location & Contact */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-stone-100 uppercase tracking-wider">
            {t('Heritage & Contact')}
          </h4>
          <ul className="space-y-3 text-xs text-stone-400">
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>{t('Authentic Pakistani Heritage · KSA')}</span>
            </li>
            <li className="flex items-start gap-2">
              <Phone className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span dir="ltr">+966 XX XXX XXXX</span>
            </li>
            <li className="flex items-start gap-2">
              <Mail className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-stone-200 block">{t('For Orders')}</strong>
                <a
                  href="mailto:order@sufrahravi.com"
                  dir="ltr"
                  data-no-translate="true"
                  className="hover:text-amber-400 transition-colors"
                >
                  order@sufrahravi.com
                </a>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <Mail className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-stone-200 block">{t('Customer Support')}</strong>
                <a
                  href="mailto:support@sufrahravi.com"
                  dir="ltr"
                  data-no-translate="true"
                  className="hover:text-amber-400 transition-colors"
                >
                  support@sufrahravi.com
                </a>
              </div>
            </li>
          </ul>
        </div>

      </div>

      <div className="border-t border-stone-900 py-6 text-center text-xs text-stone-500">
        <p>{t('© 2026 Sufrah Ravi (سفرة راوي). All rights reserved. Authentic taste from Pakistan.')}</p>
      </div>
    </footer>
  );
};
