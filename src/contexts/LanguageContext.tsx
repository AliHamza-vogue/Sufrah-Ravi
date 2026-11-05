import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';

export type Language = 'en' | 'ar';

interface LanguageContextValue {
  language: Language;
  isArabic: boolean;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (text: string) => string;
  isTranslating: boolean;
}

const CACHE_STORAGE_KEY = 'sufrah_ravi_ar_cache_v2';
const LANG_STORAGE_KEY = 'sufrah_ravi_lang_pref';

/**
 * Built-in authentic local dialect dictionary for instant 0ms switching
 * of all core restaurant content, menu dishes, and UI controls.
 * Note: Any text that was already in Arabic in the English view is removed in the Arabic translation.
 */
export const QASSIMI_DICTIONARY: Record<string, string> = {
  // Brand & Navigation
  'Sufrah Ravi': 'سفرة راوي',
  'Home': 'الرئيسية',
  'Menu & Order': 'المنيو واطلب الحين',
  'Order History': 'سجل طلباتك',
  'Our Story & Pakistani Heritage': 'قصتنا وتراث باكستان',
  'Reviews': 'آراء الزباين',
  'Sign Up / Sign In': 'سجّل دخولك / حساب جديد',
  'Cart': 'السلة',
  'Logout': 'تسجيل خروج',
  'Log Out': 'تسجيل خروج',
  'Ambience On': 'أجواء المطعم شغّالة',
  'Ambience Muted': 'صوت الأجواء مكتوم',
  'Mute kitchen ambience': 'كتم صوت أجواء المطعم',
  'Unmute kitchen ambience': 'تشغيل صوت أجواء المطعم',

  // Hero Section (existing Arabic text removed when translated)
  'Authentic Taste from Pakistan · المذاق الأصيل من باكستان':
    'الطعم الباكستاني الأصيل على الكيف',
  'Authentic Taste from Pakistan': 'الطعم الباكستاني الأصيل على الكيف',
  'Welcome to': 'يا هلا والله ومسهلا بـ',
  'Experience the legendary homestyle flavors inspired by the culinary heritage of Pakistan. From freshly made tawa rotis and golden crispy anda parathas to slow-simmered chicken qorma and fragrant karak chai.':
    'ذوق الطعم البيتي الأصيل من تراث باكستان العريق.. من خبز الصاج الحار والباراثا المقرمشة بالبيض لين إيدام الدجاج (قورما) المسبّك وشاهي الكرك اللي يعدّل الراس بالحيل.',
  'Order Online Now': 'اطلب الحين ويجيك حار',
  'Our Heritage & Story': 'علومنا وقصتنا',
  'Hours': 'أوقات الدوام',
  '6:00 AM – 11:30 PM': '٦:٠٠ الصبح – ١١:٣٠ بالليل',
  'Heritage': 'الأصالة',
  'Pakistan': 'باكستان',
  'Specialty': 'وش نتميّز به',
  'Fresh Tawa & Qorma': 'خبز صاج حار وقورما على الكيف',
  'Freshly Prepared Daily': 'مقضّي ومضبوط كل يوم طازج',
  'Nashta, Qorma & Karak Chai': 'فطور نشتا، قورما وشاهي كرك',
  '100% Homestyle': '١٠٠٪ شغل بيت على الكيف',

  // Menu Section Header & Filters
  'Our Menu · قائمة الطعام': 'منيو سفرة راوي',
  'Our Menu': 'منيو سفرة راوي',
  'Freshly Prepared Homestyle Meals': 'أكلات بيتية طازجة مضبوطة كل يوم',
  'Choose your favorite morning nashta, daal & sabzi, homestyle chicken, or karak chai. Order online for quick delivery or takeaway.':
    'تخيّر اللي تشتهيه من فطور الصباح، العدس والخضار، إيدامات الدجاج المسبّكة أو شاهي الكرك واللبن.. اطلب الحين توصيل سريع أو استلام.',
  'All Items': 'كل الأصناف',
  '1. Morning Nashta': '١. فطور الصباح (نشتا)',
  '2. Daal & Sabzi': '٢. عدس وخضار يومية',
  '3. Homestyle Chicken': '٣. إيدامات دجاج بيتية',
  '4. Chai & Lassi': '٤. شاهي كرك ولاسي',
  'Search dishes (e.g. Qorma, Paratha)...': 'دوّر أكلتك (مثل: قورما، باراثا، كرك)...',
  'Best Seller': 'الأكثر طلباً بالحيل',
  'Sugar: Regular': 'السكر: وسط على الكيف',
  'Sugar: No Sugar': 'السكر: بدون سكر',
  'Sugar: Less Sugar': 'السكر: خفيف',
  'Sugar: Regular Sugar': 'السكر: وسط على الكيف',
  'Sugar: Extra Sweet': 'السكر: حالي بالحيل',
  'Freshly Made on Tawa': 'مخبوز الحين عالصاج حار',
  'Spice: Mild': 'الحرارة: خفيف',
  'Spice: Medium': 'الحرارة: وسط',
  'Spice: Spicy': 'الحرارة: حار',
  'Spice: Extra': 'الحرارة: حار بالحيل',
  'Spice: Extra Spicy': 'الحرارة: حار بالحيل',
  'Quick Add': 'أضفه عالسريع',
  'Added': 'انضاف للسلة',
  'No menu items found matching your query.': 'ما لقينا صنف يطابق بحثك يالغالي.',
  'SAR': 'ريال',
  'Free': 'مجاناً',
  'Delivery': 'التوصيل',

  // Menu Items (Names & Descriptions)
  'Anda Paratha': 'باراثا بالبيض (أندا باراثا)',
  'Golden crispy flaky whole wheat paratha served with a perfectly spiced homestyle fried egg.':
    'فطيرة باراثا بر مقرمشة ومقمرة بالسمن، معها بيض مقلي مبهر على طريقة أهل البيت تفتح النفس.',
  'Paratha Channay': 'باراثا مع حمص (تشانا)',
  'Freshly layered crispy paratha accompanied by rich, slow-simmered Punjabi style chickpea gravy.':
    'باراثا مورّقة ومقرمشة تجيك مع مرقة حمص مسبّكة على نار هادية بطعم أصيل يشبع ويدفّي.',
  'Sada Paratha': 'باراثا سادة مقرمشة',
  'Traditional golden tawa paratha made with pure ghee and multi-layered crispy dough.':
    'فطيرة صاج ذهبية مورّقة ومدهونة بالسمن الصافي، مقرمشة من برا وطرية من جوا.',
  'Tarka Daal + 2 Rotis': 'عدس تركة (دال) + ٢ خبز صاج',
  'Aromatic yellow lentils tempered with garlic, cumin, and red chili, served with two fresh tawa rotis.':
    'عدس أصفر مسبّك مع كشنة الثوم والكمون والفلفل، يجيك معه خبزتين صاج حارة توّها طالعة.',
  'Daily Sabzi + 2 Rotis': 'إيدام خضار اليوم + ٢ خبز صاج',
  'Fresh seasonal vegetable curry cooked with traditional homestyle spices, served with two hot rotis.':
    'إيدام خضار طازج مطبوخ ببهارات البيت الأصيلة، يقدّم مع خبزتين صاج حارة.',
  'Aloo Anda': 'إيدام بطاطس بالبيض (آلو أندا)',
  'Comforting homestyle potato and boiled egg curry simmered in an onion-tomato masala gravy.':
    'إيدام بطاطس وبيض بمرقة الطماطم والبصل المسبّكة على الكيف، أكلة بيتية ما ينشبع منها.',
  'Chicken Qorma': 'قورما دجاج أصيلة',
  'Tender chicken pieces simmered in a rich, aromatic yogurt and caramelized onion gravy with traditional spices.':
    'قطع دجاج طرية مطبوخة على مهل بمرقة الزبادي والبصل المحمّر والبهارات الخاصة.. طعمٍ بالراس.',
  'Murgh Channay': 'دجاج بالحمص (مرغ تشانا)',
  'Slow-cooked chicken and chickpeas combined in a thick, hearty, flavorful Lahore-style broth.':
    'دجاج وحمص مطبوخين سوا بمرقة ثقيلة ومسبّكة بالحيل، من أطيب الأكلات الشعبية.',
  'Chicken Aloo Keema': 'قيما دجاج بالبطاطس',
  'Minced chicken and tender potato cubes sautéed with ginger, garlic, green chilies, and fresh coriander.':
    'دجاج مفروم مع مكعبات بطاطس محموسة بالزنجبيل والثوم والفلفل الأخضر والكزبرة الطازجة.',
  'Karak Doodh Patti': 'شاهي كرك دوده باتي',
  'Authentic slow-boiled strong milk tea brewed with cardamom for that perfect morning kick.':
    'شاهي حليب ثقيل مغلي على نار هادية مع الهيل الطيب.. يعدّل المزاج الصبح والعصر.',
  'Ghar Ki Lassi': 'لبن لاسي بيتي بارد',
  'Traditional creamy homemade sweet lassi churned fresh to cool down your palate.':
    'لبن لاسي حلو وثقيل مخفوق طازج يبرّد على قلبك بالحيل.',
  'Tawa Roti': 'خبز صاج (تاوا روتي)',
  'Freshly made soft whole wheat tawa flatbread.': 'خبز بر طري ومقمّر عالصاج أول بأول.',

  // Customization Modal
  'Sugar Level': 'مقدار السكر (وشلون تبي السكر؟)',
  'No Sugar': 'بدون سكر (مر)',
  'Less Sugar': 'سكر خفيف',
  'Regular': 'وسط على الكيف',
  'Regular Sugar': 'وسط على الكيف',
  'Extra Sweet': 'حالي بالحيل',
  'Spice Level': 'درجة الحرارة (الفلفل)',
  'Mild': 'خفيف',
  'Medium': 'وسط',
  'Spicy': 'حار',
  'Extra': 'حار بالحيل',
  'Extra Spicy': 'حار بالحيل',
  'Quantity': 'الكمية',
  'Special Instructions (Optional)': 'ملاحظات للمطبخ (اختياري)',
  'e.g. Serve piping hot, extra cardamom...': 'مثل: خلوه حار بالحيل، زوّد الهيل...',
  'e.g. Extra crispy paratha, less oil...': 'مثل: قرمش الباراثا زيادة، قلل الزيت...',
  'Cancel': 'إلغاء',
  'Add to Cart': 'أضفه للسلة',

  // Order History Section
  'Order History · سجل الطلبات': 'سجل طلباتك',
  'Your Past Orders & Quick Reorder': 'طلباتك السابقة واطلبها مرة ثانية بضغطة',
  'View your previous Sufrah Ravi meals stored in our live database and reorder your favorite dishes in a single tap.':
    'شف طلباتك اللي راحت عندنا، وإذا اشتهيت تعيد الطلب اضغط زر واحد وتنزل بالسلة على طول.',
  'My Orders': 'طلباتي',
  'All Recent': 'كل الطلبات الأخيرة',
  'Search Order # or dish...': 'ابحث برقم الطلب أو اسم الأكلة...',
  'Loading your order history...': 'قاعدين نجيب سجل طلباتك...',
  'No Past Orders Found': 'ما لقينا طلبات سابقة يالغالي',
  'You haven’t placed an order yet. Explore our freshly prepared Nashta, Qorma, and Karak Chai to place your first order!':
    'للحين ما طلبت من عندنا! تفرّج على المنيو وجرّب الباراثا والقورما وشاهي الكرك اللي يفتح النفس.',
  'No orders matched your search query. Try clearing the search box.':
    'ما فيه طلب يطابق بحثك، جرّب تمسح مربع البحث.',
  'Browse Menu & Order': 'تصفّح المنيو واطلب الحين',
  'Ordered Items': 'الأصناف المطلوبة',
  'Card / Apple Pay': 'بطاقة / Apple Pay',
  'Cash on Delivery': 'الدفع عند الاستلام',
  'Add': 'أضف',
  'Reorder Entire Meal': 'اطلب هالوجبة كاملة مرة ثانية',
  'Added All Items to Cart!': 'انضافت كل الأصناف للسلة!',
  'Received': 'وصلنا طلبك',
  'Preparing': 'قاعدين نجهّزه بالمطبخ',
  'Ready': 'جاهز للاستلام/التوصيل',
  'Delivered': 'تم التوصيل بالعافية',
  'Just now': 'توّه الحين',
  'Guest': 'زائر',

  // Story Section
  'Our Story & Pakistani Heritage · قصة سفرة راوي': 'قصتنا وتراث باكستان',
  'The Rich Flavors & Hospitality of Pakistan': 'النكهة الأصيلة والكرم الباكستاني على أصوله',
  'Sufrah Ravi (سفرة راوي) draws its name and authentic soul from the rich culinary traditions and boundless hospitality of Pakistan. Our dishes carry the genuine, time-honored taste of the subcontinent, where every gathering around a shared table ("Sufrah") celebrates timeless food stories, warm connections, and the vibrant heritage of Pakistan.':
    'سفرة راوي أخذت اسمها وروحها من كرم أهل باكستان وطبخهم الأصيل اللي يبيض الوجه. أكلاتنا تجيكم بنفس النكهة التقليدية المسبّكة، عشان تكون كل جمعة حول السفرة مليانة علوم طيبة وطعم ما ينتسى.',
  'Traditional Pakistani Nashta': 'فطور باكستاني أصيل (نشتا)',
  'Flaky tawa parathas and spiced channay made with authentic Pakistani recipes.':
    'باراثا مقرمشة عالصاج مع حمص مسبّك بالخلطة الباكستانية الأصلية.',
  'Slow-boiled aromatic cardamom tea brewed the authentic Pakistani way.':
    'شاهي كرك بالحليب والهيل مطبوخ على نار هادية على الطريقة الباكستانية الأصيلة.',

  // Reviews Section
  'Customer Testimonials · آراء العملاء': 'كلام زبايننا وتجاربهم',
  'Customer Testimonials': 'كلام زبايننا وتجاربهم',
  'Real Customer Reviews': 'آراء زبايننا الحقيقية',
  'Every review is verified with a real customer email (kept private and never displayed publicly).':
    'كل تقييم موثّق بإيميل الزبون الحقيقي (والإيميل محفوظ بخصوصية تامة وما يطلع لأحد أبداً).',
  'Write a Review': 'اكتب تقييمك ورايك',
  'Loading verified customer reviews...': 'قاعدين نحمّل آراء الزباين...',
  'No Customer Reviews Yet': 'للحين ما أحد كتب تقييم',
  'Be the first guest to share your honest dining or delivery experience with Sufrah Ravi!':
    'كن أول واحد يشاركنا رايه وتجربته مع أكلات سفرة راوي!',
  'Submit the First Review': 'اكتب أول تقييم',
  'Verified Customer': 'زبون موثّق',
  'Share Your Experience': 'شاركنا تجربتك ورايك',
  'Write a Customer Review': 'اكتب تقييمك لسفرة راوي',
  'Your Name': 'اسمك الكريم',
  'Your Email Address': 'إيميلك (للتوثيق بس)',
  'Your email is required for verification and will never be shown publicly.':
    'الإيميل مطلوب عشان نأكد التقييم بس، ولا راح يظهر بالموقع أبداً.',
  'Rating': 'تقييمك بالنجوم',
  'Your Review': 'وش رايك بالأكل والخدمة؟',
  'Tell us about your meal...': 'علّمنا وش رايك بالأكل والطعم...',
  'Submitting...': 'جاري الإرسال...',
  'Submit Review': 'اعتمد التقييم',

  // Cart & Checkout & Auth
  'Your Order Cart': 'سلة طلباتك',
  'Your cart is empty.': 'سلتك فاضية الحين يالغالي.',
  'Add delicious items from our menu to start your order.':
    'أضف اللي تشتهيه من المنيو وابدأ طلبك.',
  'Subtotal': 'المجموع الفرعي',
  'Delivery Fee': 'رسوم التوصيل',
  '(Free over 30 SAR)': '(مجاني للطلبات فوق ٣٠ ريال)',
  'Total Amount': 'الإجمالي الكلي',
  'Proceed to Checkout': 'كمّل الطلب وادفع',
  'Secure Checkout · إتمام الطلب': 'تأكيد الطلب',
  'Secure Checkout': 'تأكيد الطلب',
  'Complete Your Order': 'كمّل بيانات طلبك',
  'Full Name': 'الاسم الكامل',
  'Phone Number': 'رقم الجوال',
  'Delivery Address': 'عنوان التوصيل بالتفصيل',
  'Street, District, Building No...': 'الحي، الشارع، رقم البيت أو المعلم القريب...',
  'Payment Method': 'طريقة الدفع',
  'Online Card / Apple Pay': 'بطاقة مدى / فيزا / Apple Pay',
  'Online Card': 'بطاقة إلكترونية',
  'Confirm & Place Order': 'اعتمد الطلب الحين',
  'Placing Order...': 'جاري اعتماد طلبك...',
  'Order Placed Successfully!': 'تم اعتماد طلبك وأبشر بسعدك!',
  'Thank You': 'يعطيك العافية',
  'Order Status': 'حالة الطلب',
  'View Order History': 'شف سجل طلباتك',
  'Return to Menu': 'ارجع للمنيو',
  'Create Account': 'افتح حساب جديد',
  'Sign In': 'تسجيل الدخول',
  'Sign Up': 'تسجيل حساب جديد',
  'Email Address': 'البريد الإلكتروني',
  'Password': 'كلمة المرور',
  'Minimum 6 characters': '٦ خانات على الأقل',
  'Already have an account? Sign In': 'عندك حساب من أول؟ سجّل دخولك',
  "Don't have an account? Sign Up": 'ما عندك حساب؟ افتح حساب جديد الحين',
  'Your Account · حسابك': 'حسابك',
  'Your Account': 'حسابك',
  'Sufrah Ravi Account · حساب العملاء': 'حساب العملاء',
  'Sufrah Ravi Account': 'حساب العملاء',
  'Account Profile': 'بيانات حسابك',
  'Verified Sufrah Ravi Database Account': 'حساب موثّق بقاعدة بيانات سفرة راوي',
  'Creating Account...': 'جاري فتح حسابك...',
  'Verifying Password...': 'جاري التأكد من كلمة المرور...',
  'Close': 'إغلاق',

  // Footer
  'Your authentic destination for homestyle Pakistani comfort food, celebrating the rich culinary heritage of Pakistan. Fresh Tawa Rotis, Morning Nashta, and Karak Chai daily.':
    'وجهتك الأولى للأكل الباكستاني البيتي الأصيل على الكيف.. خبز صاج حار، فطور نشتا، وشاهي كرك مضبوط كل يوم.',
  'Opening Hours': 'أوقات العمل',
  'Everyday': 'كل يوم',
  'Morning Nashta Special': 'فطور الصباح (النشتا)',
  '6:00 AM – 12:00 PM': '٦:٠٠ الصبح – ١٢:٠٠ الظهر',
  'Heritage & Contact': 'الأصالة والتواصل',
  'Authentic Pakistani Heritage · KSA': 'تراث باكستاني أصيل · المملكة العربية السعودية',
  '© 2026 Sufrah Ravi (سفرة راوي). All rights reserved. Authentic taste from Pakistan.':
    '© ٢٠٢٦ سفرة راوي. جميع الحقوق محفوظة. الطعم الباكستاني الأصيل على الكيف.',
};

const LanguageContext = createContext<LanguageContextValue>({
  language: 'en',
  isArabic: false,
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: (text) => text,
  isTranslating: false,
});

export const useLanguage = () => useContext(LanguageContext);

function loadDynamicCache(): Record<string, string> {
  try {
    const raw = localStorage.getItem(CACHE_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveDynamicCache(cache: Record<string, string>) {
  try {
    localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * If a string contains both English and Arabic (e.g. "Heading · عنوان"),
 * strip the already-Arabic portion so we only translate the English text.
 */
function stripExistingArabic(input: string): string {
  if (/[a-zA-Z]/.test(input) && /[\u0600-\u06FF]/.test(input)) {
    return input
      .replace(/[\u0600-\u06FF]+/g, '')
      .replace(/[·•|()[\]]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
  return input;
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY);
      return saved === 'ar' ? 'ar' : 'en';
    } catch {
      return 'en';
    }
  });

  const [dynamicCache, setDynamicCache] = useState<Record<string, string>>(() =>
    loadDynamicCache()
  );
  const [isTranslating, setIsTranslating] = useState<boolean>(false);

  const pendingTextsRef = useRef<Set<string>>(new Set());
  const inFlightTextsRef = useRef<Set<string>>(new Set());
  const debounceTimerRef = useRef<number | null>(null);
  const originalDomTextMapRef = useRef<WeakMap<Node, string>>(new WeakMap());

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {
      // Ignore storage errors
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  }, [language, setLanguage]);

  // Update document direction and language attribute
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language === 'ar' ? 'ar-SA' : 'en';
  }, [language]);

  const flushTranslationQueue = useCallback(async () => {
    const toTranslate = Array.from(pendingTextsRef.current).filter(
      (txt) =>
        !QASSIMI_DICTIONARY[txt] &&
        !dynamicCache[txt] &&
        !inFlightTextsRef.current.has(txt)
    );
    pendingTextsRef.current.clear();

    if (toTranslate.length === 0) return;

    toTranslate.forEach((txt) => inFlightTextsRef.current.add(txt));
    setIsTranslating(true);

    try {
      const response = await fetch('/api/translate/qassimi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texts: toTranslate }),
      });

      if (response.ok) {
        const data = (await response.json()) as { translations?: string[] };
        if (Array.isArray(data.translations)) {
          setDynamicCache((prev) => {
            const updated = { ...prev };
            toTranslate.forEach((orig, idx) => {
              const translated = data.translations?.[idx];
              if (translated && typeof translated === 'string') {
                updated[orig] = translated;
              }
            });
            saveDynamicCache(updated);
            return updated;
          });
        }
      }
    } catch (error) {
      console.error('Auto-translate error:', error);
    } finally {
      toTranslate.forEach((txt) => inFlightTextsRef.current.delete(txt));
      setIsTranslating(false);
    }
  }, [dynamicCache]);

  const queueForTranslation = useCallback(
    (rawText: string) => {
      const trimmed = rawText.trim();
      if (
        !trimmed ||
        trimmed.length < 2 ||
        QASSIMI_DICTIONARY[trimmed] ||
        dynamicCache[trimmed] ||
        inFlightTextsRef.current.has(trimmed) ||
        !/[a-zA-Z]{2,}/.test(trimmed)
      ) {
        return;
      }

      pendingTextsRef.current.add(trimmed);
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = window.setTimeout(() => {
        flushTranslationQueue();
      }, 180);
    },
    [dynamicCache, flushTranslationQueue]
  );

  const t = useCallback(
    (text: string): string => {
      if (!text || language === 'en') return text;
      const trimmed = text.trim();
      if (QASSIMI_DICTIONARY[trimmed]) {
        return QASSIMI_DICTIONARY[trimmed];
      }
      const stripped = stripExistingArabic(trimmed);
      if (QASSIMI_DICTIONARY[stripped]) {
        return QASSIMI_DICTIONARY[stripped];
      }
      if (dynamicCache[trimmed]) {
        return dynamicCache[trimmed];
      }
      if (dynamicCache[stripped]) {
        return dynamicCache[stripped];
      }
      // Automatically queue any unknown English string for translation
      queueForTranslation(stripped);
      return stripped;
    },
    [language, dynamicCache, queueForTranslation]
  );

  // Automatic DOM MutationObserver: catches any newly added unwrapped text automatically
  // while respecting elements with data-no-translate="true"
  useEffect(() => {
    const rootEl = document.getElementById('root');
    if (!rootEl) return;

    const processNode = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const parentEl = node.parentElement;
        if (!parentEl) return;
        const parentTag = parentEl.tagName;
        if (
          parentTag === 'SCRIPT' ||
          parentTag === 'STYLE' ||
          parentTag === 'TEXTAREA' ||
          parentEl.closest('[data-no-translate="true"]')
        ) {
          return;
        }

        const currentVal = node.nodeValue || '';
        const trimmed = currentVal.trim();
        if (!trimmed) return;

        if (language === 'ar') {
          const stripped = stripExistingArabic(trimmed);
          const knownTranslation =
            QASSIMI_DICTIONARY[trimmed] ||
            QASSIMI_DICTIONARY[stripped] ||
            dynamicCache[trimmed] ||
            dynamicCache[stripped];
          if (knownTranslation && currentVal !== knownTranslation) {
            if (!originalDomTextMapRef.current.has(node)) {
              originalDomTextMapRef.current.set(node, currentVal);
            }
            node.nodeValue = knownTranslation;
          } else if (/[a-zA-Z]{3,}/.test(stripped)) {
            if (!originalDomTextMapRef.current.has(node)) {
              originalDomTextMapRef.current.set(node, currentVal);
            }
            queueForTranslation(stripped);
          }
        } else {
          // Restore original English text if we previously translated this DOM node
          const orig = originalDomTextMapRef.current.get(node);
          if (orig && node.nodeValue !== orig) {
            node.nodeValue = orig;
          }
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        if (el.getAttribute('data-no-translate') === 'true') return;
        if (el.hasAttribute('placeholder')) {
          const ph = el.getAttribute('placeholder') || '';
          const trimmedPh = ph.trim();
          if (language === 'ar') {
            const translatedPh =
              QASSIMI_DICTIONARY[trimmedPh] || dynamicCache[trimmedPh];
            if (translatedPh && ph !== translatedPh) {
              if (!el.dataset.origPlaceholder) {
                el.dataset.origPlaceholder = ph;
              }
              el.setAttribute('placeholder', translatedPh);
            }
          } else if (el.dataset.origPlaceholder) {
            el.setAttribute('placeholder', el.dataset.origPlaceholder);
          }
        }
        node.childNodes.forEach(processNode);
      }
    };

    processNode(rootEl);

    if (language !== 'ar') return;

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(processNode);
        } else if (mutation.type === 'characterData' && mutation.target) {
          processNode(mutation.target);
        }
      }
    });

    observer.observe(rootEl, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => observer.disconnect();
  }, [language, dynamicCache, queueForTranslation]);

  const isArabic = language === 'ar';

  return (
    <LanguageContext.Provider
      value={{
        language,
        isArabic,
        setLanguage,
        toggleLanguage,
        t,
        isTranslating,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};
