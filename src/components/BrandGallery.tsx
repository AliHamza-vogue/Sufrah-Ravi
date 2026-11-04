import React from 'react';
import { BRAND_ASSETS } from '../data/menuData';
import { ShieldCheck, Award } from 'lucide-react';

export const BrandGallery: React.FC = () => {
  return (
    <section id="gallery" className="py-20 bg-stone-900 text-white">
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-900/60 text-amber-300 rounded-full text-xs font-semibold border border-amber-700/40">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Brand Identity & Experience · الهوية البصرية</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-stone-100">
            The Sufrah Ravi Design Ecosystem
          </h2>
          <p className="text-stone-400 text-sm sm:text-base">
            Explore our restaurant architecture, custom staff uniforms, eco-friendly takeaway packaging, and signature menu boards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {BRAND_ASSETS.map((asset, index) => (
            <div
              key={index}
              className="bg-stone-950 border border-stone-800 rounded-3xl overflow-hidden shadow-xl hover:border-amber-600/50 transition-all duration-300 flex flex-col group"
            >
              <div className="relative h-64 overflow-hidden bg-stone-900">
                <img
                  src={asset.image}
                  alt={asset.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent opacity-80" />
                <span className="absolute top-4 left-4 bg-amber-700 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                  0{index + 1}
                </span>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-amber-500 tracking-wider uppercase">
                    {asset.subtitle}
                  </span>
                  <h3 className="text-xl font-bold text-stone-100">
                    {asset.title}
                  </h3>
                </div>
                <p className="text-sm text-stone-400 leading-relaxed">
                  {asset.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Quality Guarantee Box */}
        <div className="bg-stone-950 border border-amber-700/30 rounded-3xl p-8 lg:p-12 flex flex-col md:flex-row items-center justify-between gap-8 mt-12">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-2 text-amber-500 text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Authenticity & Hygiene Guaranteed</span>
            </div>
            <h3 className="text-2xl font-bold text-stone-100">
              Crafted with Tradition, Served with Pride
            </h3>
            <p className="text-stone-400 text-sm leading-relaxed">
              Every dish at Sufrah Ravi is prepared using authentic recipes, fresh ingredients, and strict hygiene standards by our professionally trained culinary team.
            </p>
          </div>
          <div className="shrink-0">
            <img
              src="/public/assets/aistudio/WhatsApp_Image_2026-11-04_at_9.55.51_AM_fa531654.jpeg"
              alt="Sufrah Ravi Seal"
              className="w-28 h-28 rounded-full object-cover border-2 border-amber-600/50 shadow-lg mx-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
