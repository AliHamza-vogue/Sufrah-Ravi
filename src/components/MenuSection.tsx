import React, { useState } from 'react';
import { MenuItem, CartItem } from '../types';
import { MENU_ITEMS } from '../data/menuData';
import { Search, Plus, Check, Flame, Coffee, Sparkles, Utensils } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { DishSteam } from './DishSteam';

interface MenuSectionProps {
  onAddToCart: (item: CartItem) => void;
}

const isBeverageWithSugar = (item: MenuItem) =>
  item.id === 'chai-1' || item.id === 'chai-2';

const isBreadWithoutSpice = (item: MenuItem) =>
  item.id === 'nashta-3' || item.id === 'chai-3';

const SUGAR_OPTIONS = [
  { level: 0, label: 'No Sugar' },
  { level: 1, label: 'Less Sugar' },
  { level: 2, label: 'Regular' },
  { level: 3, label: 'Extra Sweet' },
];

const SPICE_OPTIONS = [
  { level: 0, label: 'Mild' },
  { level: 1, label: 'Medium' },
  { level: 2, label: 'Spicy' },
  { level: 3, label: 'Extra' },
];

export const MenuSection: React.FC<MenuSectionProps> = ({ onAddToCart }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItemForModal, setSelectedItemForModal] = useState<MenuItem | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedSpice, setSelectedSpice] = useState<number>(1);
  const [specialInstructions, setSpecialInstructions] = useState<string>('');
  const [addedAnimationId, setAddedAnimationId] = useState<string | null>(null);
  const { t, language } = useLanguage();

  const filteredItems = MENU_ITEMS.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const translatedName = t(item.nameEn).toLowerCase();
    const translatedDesc = t(item.description).toLowerCase();
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      item.nameEn.toLowerCase().includes(q) ||
      item.nameUr.includes(searchQuery) ||
      item.description.toLowerCase().includes(q) ||
      translatedName.includes(q) ||
      translatedDesc.includes(q);
    return matchesCategory && matchesSearch;
  });

  const handleOpenModal = (item: MenuItem) => {
    setSelectedItemForModal(item);
    setQuantity(1);
    setSpecialInstructions('');
    if (isBeverageWithSugar(item)) {
      setSelectedSpice(2); // Default "Regular" sugar
    } else {
      setSelectedSpice(item.spicyLevel ?? 1);
    }
  };

  const handleQuickAdd = (item: MenuItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const defaultLevel = isBeverageWithSugar(item) ? 2 : (item.spicyLevel ?? 1);
    onAddToCart({
      menuItem: item,
      quantity: 1,
      selectedSpice: defaultLevel,
      specialInstructions: '',
    });
    setAddedAnimationId(item.id);
    setTimeout(() => setAddedAnimationId(null), 1200);
  };

  const handleModalAdd = () => {
    if (!selectedItemForModal) return;
    onAddToCart({
      menuItem: selectedItemForModal,
      quantity,
      selectedSpice,
      specialInstructions,
    });
    setSelectedItemForModal(null);
    setQuantity(1);
    setSpecialInstructions('');
  };

  return (
    <section id="menu" className="py-12 sm:py-16 bg-stone-50 dark:bg-stone-900 min-h-screen transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 sm:space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 rounded-full text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('Our Menu · قائمة الطعام')}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            {t('Freshly Prepared Homestyle Meals')}
          </h2>
          <p className="text-stone-600 dark:text-stone-400 text-sm sm:text-base">
            {t(
              'Choose your favorite morning nashta, daal & sabzi, homestyle chicken, or karak chai. Order online for quick delivery or takeaway.'
            )}
          </p>
        </div>

        {/* Search & Categories Toolbar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4 bg-white dark:bg-stone-950 p-3 sm:p-4 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-800">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1.5 md:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'All Items' },
              { id: 'nashta', label: '1. Morning Nashta' },
              { id: 'daal_sabzi', label: '2. Daal & Sabzi' },
              { id: 'chicken', label: '3. Homestyle Chicken' },
              { id: 'chai_lassi', label: '4. Chai & Lassi' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 sm:px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap shrink-0 ${
                  activeCategory === cat.id
                    ? 'bg-amber-700 text-white shadow-sm'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-900'
                }`}
              >
                {t(cat.label)}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder={t('Search dishes (e.g. Qorma, Paratha)...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 rtl:pl-4 rtl:pr-10 py-2.5 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredItems.map((item) => {
            const isDrink = isBeverageWithSugar(item);
            const isBread = isBreadWithoutSpice(item);
            const spiceBadgeKey =
              item.spicyLevel === 0
                ? 'Spice: Mild'
                : item.spicyLevel === 1
                ? 'Spice: Medium'
                : item.spicyLevel === 2
                ? 'Spice: Spicy'
                : 'Spice: Extra';

            return (
              <div
                key={item.id}
                onClick={() => handleOpenModal(item)}
                className="group bg-white dark:bg-stone-950 rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col cursor-pointer"
              >
                {/* Image Container */}
                <div className="relative h-48 overflow-hidden bg-stone-100 dark:bg-stone-900">
                  <img
                    src={item.image}
                    alt={item.nameEn}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  {item.id !== 'chai-2' && item.nameEn !== 'Ghar Ki Lassi' && (
                    <DishSteam variant="card" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-transparent to-transparent" />
                  
                  {item.popular && (
                    <span className="absolute top-3 left-3 rtl:left-auto rtl:right-3 z-20 bg-amber-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow">
                      {t('Best Seller')}
                    </span>
                  )}

                  <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between text-white">
                    {language === 'en' ? (
                      <span
                        data-no-translate="true"
                        className="text-xs font-semibold bg-stone-900/80 px-2.5 py-1 rounded-md backdrop-blur-sm"
                      >
                        {item.nameUr}
                      </span>
                    ) : (
                      <span />
                    )}
                    <span className="text-lg font-bold bg-amber-700/90 px-3 py-0.5 rounded-lg tabular-nums">
                      {item.price} {language === 'ar' ? 'ريال' : 'SAR'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 group-hover:text-amber-700 dark:group-hover:text-amber-500 transition-colors">
                        {t(item.nameEn)}
                      </h3>
                    </div>
                    <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed">
                      {t(item.description)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-stone-100 dark:border-stone-900">
                    {isDrink ? (
                      <div className="flex items-center gap-1.5 text-xs text-stone-500 min-w-0">
                        <Coffee className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="truncate">{t('Sugar: Regular')}</span>
                      </div>
                    ) : isBread ? (
                      <div className="flex items-center gap-1.5 text-xs text-stone-500 min-w-0">
                        <Utensils className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="truncate">{t('Freshly Made on Tawa')}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-xs text-stone-500 min-w-0">
                        <Flame className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="truncate">{t(spiceBadgeKey)}</span>
                      </div>
                    )}

                    <button
                      onClick={(e) => handleQuickAdd(item, e)}
                      className={`shrink-0 flex items-center gap-1.5 px-3.5 sm:px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
                        addedAnimationId === item.id
                          ? 'bg-emerald-600 text-white'
                          : 'bg-stone-900 hover:bg-amber-700 text-white dark:bg-stone-800 dark:hover:bg-amber-700'
                      }`}
                    >
                      {addedAnimationId === item.id ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>{t('Added')}</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          <span>{t('Quick Add')}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-20 bg-white dark:bg-stone-950 rounded-2xl border border-stone-200 dark:border-stone-800">
            <p className="text-stone-500 text-base font-medium">
              {t('No menu items found matching your query.')}
            </p>
          </div>
        )}
      </div>

      {/* Item Customization Modal */}
      {selectedItemForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-md w-full p-5 sm:p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
            
            <div className="flex items-start justify-between gap-3">
              <div>
                {language === 'en' && (
                  <span
                    data-no-translate="true"
                    className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider"
                  >
                    {selectedItemForModal.nameUr}
                  </span>
                )}
                <h3 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 mt-0.5">
                  {t(selectedItemForModal.nameEn)}
                </h3>
              </div>
              <span className="shrink-0 text-base sm:text-lg font-bold text-amber-700 dark:text-amber-400 tabular-nums bg-amber-50 dark:bg-amber-950/50 px-3 py-1 rounded-xl">
                {selectedItemForModal.price * quantity}{' '}
                {language === 'ar' ? 'ريال' : 'SAR'}
              </span>
            </div>

            <p className="text-sm text-stone-600 dark:text-stone-400">
              {t(selectedItemForModal.description)}
            </p>

            {/* Sugar Level Selector for Karak Doodh Patti & Ghar Ki Lassi */}
            {isBeverageWithSugar(selectedItemForModal) ? (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                  {t('Sugar Level')}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SUGAR_OPTIONS.map((s) => (
                    <button
                      key={s.level}
                      onClick={() => setSelectedSpice(s.level)}
                      className={`py-2.5 px-2 text-xs font-semibold rounded-xl border transition-all ${
                        selectedSpice === s.level
                          ? 'bg-amber-700 text-white border-amber-700 shadow-sm'
                          : 'bg-stone-100 dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:border-amber-600'
                      }`}
                    >
                      {t(s.label)}
                    </button>
                  ))}
                </div>
              </div>
            ) : !isBreadWithoutSpice(selectedItemForModal) ? (
              /* Spice Level Selector for Spiced Dishes */
              <div className="space-y-2">
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                  {t('Spice Level')}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SPICE_OPTIONS.map((s) => (
                    <button
                      key={s.level}
                      onClick={() => setSelectedSpice(s.level)}
                      className={`py-2.5 px-2 text-xs font-semibold rounded-xl border transition-all ${
                        selectedSpice === s.level
                          ? 'bg-amber-700 text-white border-amber-700 shadow-sm'
                          : 'bg-stone-100 dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:border-amber-600'
                      }`}
                    >
                      {t(s.label)}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Quantity */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                {t('Quantity')}
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-900 text-stone-800 dark:text-stone-200 font-bold hover:bg-stone-200 dark:hover:bg-stone-800 flex items-center justify-center text-lg"
                >
                  -
                </button>
                <span className="text-lg font-bold text-stone-900 dark:text-stone-100 tabular-nums">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-900 text-stone-800 dark:text-stone-200 font-bold hover:bg-stone-200 dark:hover:bg-stone-800 flex items-center justify-center text-lg"
                >
                  +
                </button>
              </div>
            </div>

            {/* Special Instructions */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                {t('Special Instructions (Optional)')}
              </label>
              <input
                type="text"
                maxLength={50}
                placeholder={
                  isBeverageWithSugar(selectedItemForModal)
                    ? t('e.g. Serve piping hot, extra cardamom...')
                    : t('e.g. Extra crispy paratha, less oil...')
                }
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                className="w-full px-4 py-2.5 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-stone-100 dark:border-stone-900">
              <button
                onClick={() => setSelectedItemForModal(null)}
                className="flex-1 py-3 bg-stone-100 dark:bg-stone-900 text-stone-700 dark:text-stone-300 font-semibold rounded-xl hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors text-sm"
              >
                {t('Cancel')}
              </button>
              <button
                onClick={handleModalAdd}
                className="flex-1 py-3 bg-amber-700 hover:bg-amber-800 text-white font-semibold rounded-xl shadow-md transition-colors text-sm"
              >
                {t('Add to Cart')} ({selectedItemForModal.price * quantity}{' '}
                {language === 'ar' ? 'ريال' : 'SAR'})
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
