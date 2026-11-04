import { MenuItem } from '../types';

export const MENU_ITEMS: MenuItem[] = [
  // 1. Morning Nashta
  {
    id: 'nashta-1',
    nameEn: 'Anda Paratha',
    nameUr: 'اثم منن',
    category: 'nashta',
    price: 6,
    description: 'Golden crispy flaky whole wheat paratha served with a perfectly spiced homestyle fried egg.',
    image: '/public/assets/aistudio/image_6da5e4b6.png',
    popular: true,
    spicyLevel: 1
  },
  {
    id: 'nashta-2',
    nameEn: 'Paratha Channay',
    nameUr: 'مقاج روح',
    category: 'nashta',
    price: 8,
    description: 'Freshly layered crispy paratha accompanied by rich, slow-simmered Punjabi style chickpea gravy.',
    image: '/public/assets/aistudio/image_73929e3e.png',
    popular: true,
    spicyLevel: 2
  },
  {
    id: 'nashta-3',
    nameEn: 'Sada Paratha',
    nameUr: 'متتبر صدد',
    category: 'nashta',
    price: 2,
    description: 'Traditional golden tawa paratha made with pure ghee and multi-layered crispy dough.',
    image: '/public/assets/aistudio/image_003bdcd6.png',
    popular: false,
    spicyLevel: 0
  },

  // 2. Daily Daal & Sabzi
  {
    id: 'daal-1',
    nameEn: 'Tarka Daal + 2 Rotis',
    nameUr: 'تارك دال ... 7',
    category: 'daal_sabzi',
    price: 7,
    description: 'Aromatic yellow lentils tempered with garlic, cumin, and red chili, served with two fresh tawa rotis.',
    image: '/public/assets/aistudio/image_277c0c5c.png',
    popular: true,
    spicyLevel: 1
  },
  {
    id: 'daal-2',
    nameEn: 'Daily Sabzi + 2 Rotis',
    nameUr: 'هراج رمي',
    category: 'daal_sabzi',
    price: 8,
    description: 'Fresh seasonal vegetable curry cooked with traditional homestyle spices, served with two hot rotis.',
    image: '/public/assets/aistudio/image_ea55618c.png',
    popular: false,
    spicyLevel: 1
  },
  {
    id: 'daal-3',
    nameEn: 'Aloo Anda',
    nameUr: 'آحلم احلم',
    category: 'daal_sabzi',
    price: 8,
    description: 'Comforting homestyle potato and boiled egg curry simmered in an onion-tomato masala gravy.',
    image: '/public/assets/aistudio/image_3e1e1772.png',
    popular: true,
    spicyLevel: 2
  },

  // 3. Homestyle Chicken
  {
    id: 'chicken-1',
    nameEn: 'Chicken Qorma',
    nameUr: 'قعربج',
    category: 'chicken',
    price: 12,
    description: 'Tender chicken pieces simmered in a rich, aromatic yogurt and caramelized onion gravy with traditional spices.',
    image: '/public/assets/aistudio/image_12ebb9d1.png',
    popular: true,
    spicyLevel: 2
  },
  {
    id: 'chicken-2',
    nameEn: 'Murgh Channay',
    nameUr: 'هراج رمي',
    category: 'chicken',
    price: 13,
    description: 'Slow-cooked chicken and chickpeas combined in a thick, hearty, flavorful Lahore-style broth.',
    image: '/public/assets/aistudio/image_2a89e350.png',
    popular: true,
    spicyLevel: 3
  },
  {
    id: 'chicken-3',
    nameEn: 'Chicken Aloo Keema',
    nameUr: 'دجاج آحلو كيفعة',
    category: 'chicken',
    price: 12,
    description: 'Minced chicken and tender potato cubes sautéed with ginger, garlic, green chilies, and fresh coriander.',
    image: '/public/assets/aistudio/image_28443ca2.png',
    popular: false,
    spicyLevel: 2
  },

  // 4. Chai & Lassi
  {
    id: 'chai-1',
    nameEn: 'Karak Doodh Patti',
    nameUr: 'كررك مودمك',
    category: 'chai_lassi',
    price: 3,
    description: 'Authentic slow-boiled strong milk tea brewed with cardamom for that perfect morning kick.',
    image: '/public/assets/aistudio/image_f7e346e3.png',
    popular: true,
    spicyLevel: 0
  },
  {
    id: 'chai-2',
    nameEn: 'Ghar Ki Lassi',
    nameUr: 'غرر کی لاسی',
    category: 'chai_lassi',
    price: 5,
    description: 'Traditional creamy homemade sweet lassi churned fresh to cool down your palate.',
    image: '/public/assets/aistudio/image_4c4ecfd9.png',
    popular: true,
    spicyLevel: 0
  },
  {
    id: 'chai-3',
    nameEn: 'Tawa Roti',
    nameUr: 'تووا روتی',
    category: 'chai_lassi',
    price: 1,
    description: 'Freshly made soft whole wheat tawa flatbread.',
    image: '/public/assets/aistudio/image_78dcb4ef.png',
    popular: false,
    spicyLevel: 0
  }
];

export const BRAND_ASSETS = [
  {
    title: 'Storefront & Exterior',
    subtitle: 'Sufrah Ravi Restaurant Architecture',
    image: '/public/assets/aistudio/WhatsApp_Image_2026-11-04_at_9.49.37_AM_ae8be6bc.jpeg',
    desc: 'Our welcoming storefront featuring warm terracotta signage, brickwork, and cozy interior seating in Riyadh.'
  },
  {
    title: 'Digital & Light Menu',
    subtitle: 'Authentic Nashta & Homestyle Menu',
    image: '/public/assets/aistudio/WhatsApp_Image_2026-11-04_at_9.49.38_AM__1__5d83bc82.jpeg',
    desc: 'The complete daily menu board showcasing Morning Nashta, Daal & Sabzi, Homestyle Chicken, and Karak Chai.'
  },
  {
    title: 'Staff Uniforms & Aprons',
    subtitle: 'Professional Hospitality Attire',
    image: '/public/assets/aistudio/WhatsApp_Image_2026-11-04_at_9.49.38_AM_a3fab39c.jpeg',
    desc: 'Custom embroidered polo shirts, leather-strapped aprons, and caps worn by our dedicated culinary team.'
  },
  {
    title: 'Eco Packaging & Cups',
    subtitle: 'Sustainable Takeaway Experience',
    image: '/public/assets/aistudio/WhatsApp_Image_2026-11-04_at_9.49.39_AM_f0178a93.jpeg',
    desc: 'Branded kraft paper bags, food boxes, wax paper stamp seals, and insulated hot cups for your meals on the go.'
  },
  {
    title: 'Official Wordmark Logo',
    subtitle: 'Sufrah Ravi | سفرة راوي',
    image: '/public/assets/aistudio/WhatsApp_Image_2026-11-04_at_9.53.22_AM_5b92b087.jpeg',
    desc: 'Our signature emblem featuring the traditional cooking pot with flame and bilingual typography.'
  },
  {
    title: 'Emblem Badge',
    subtitle: 'Seal of Authenticity',
    image: '/public/assets/aistudio/WhatsApp_Image_2026-11-04_at_9.55.51_AM_fa531654.jpeg',
    desc: 'Circular stamp insignia used across packaging, seals, and staff merchandise.'
  }
];
