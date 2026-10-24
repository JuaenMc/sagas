import { Product } from '../types';

export const PRODUCTS: Product[] = [
  {
    id: 'prod-vestido-floral',
    name: 'Vestido Floral Algodão',
    category: 'infantil',
    subCategory: 'Vestidos',
    ageGroup: '2 a 10 anos',
    price: 49.90,
    originalPrice: 79.90,
    discountPercent: 37,
    rating: 4.9,
    reviewsCount: 324,
    badge: 'Combo 3 por 100',
    secondaryBadge: '-37%',
    images: [
      'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?auto=format&fit=crop&w=900&q=80'
    ],
    colors: [
      { name: 'Rosê Floral', hex: '#E7B1A5' },
      { name: 'Menta', hex: '#A8D5BA' },
      { name: 'Amarelo Manteiga', hex: '#F7DE9B' },
      { name: 'Lavanda', hex: '#D4C5E2' }
    ],
    sizes: ['P', 'M', 'G', 'GG'],
    inStock: true,
    isComboEligible: true,
    description: 'Confeccionado em tecido 100% algodão nobre e respirável, pensado especialmente para dar conforto e total liberdade nas brincadeiras. Modelagem evasê leve, toque suave e acabamento com botões delicados de madrepérola natural.',
    fabricInfo: 'Composição: 100% Algodão Premium Fio Penteado. Lavagem em modo suave, não usar alvejante com cloro.',
    measurementsInfo: 'P (2-3 anos): Busto 52cm, Comprimento 50cm\nM (4-5 anos): Busto 56cm, Comprimento 56cm\nG (6-7 anos): Busto 62cm, Comprimento 62cm\nGG (8-10 anos): Busto 68cm, Comprimento 70cm'
  },
  {
    id: 'prod-safari-shorts',
    name: 'Conjunto Safari Shorts',
    category: 'infantil',
    subCategory: 'Conjuntos',
    ageGroup: '2 a 6 anos',
    price: 45.00,
    originalPrice: 65.00,
    discountPercent: 30,
    rating: 4.8,
    reviewsCount: 140,
    badge: '2 a 6 anos',
    secondaryBadge: 'Frete Grátis',
    images: [
      'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=900&q=80'
    ],
    colors: [
      { name: 'Menta / Areia', hex: '#A8D5BA' },
      { name: 'Terracota', hex: '#C86D51' },
      { name: 'Azul Céu', hex: '#A7C7E7' }
    ],
    sizes: ['2 anos', '4 anos', '6 anos'],
    inStock: true,
    isComboEligible: true,
    description: 'Camiseta estampada safari com bermuda de cós elástico confortável em sarja acetinada leve.',
    fabricInfo: '100% Algodão sustentável brasileiro. Secagem rápida e toque ultra macio.'
  },
  {
    id: 'prod-macaquinho-jeans',
    name: 'Macaquinho Jeans Leve',
    category: 'infantil',
    subCategory: 'Macacões',
    ageGroup: '2 a 8 anos',
    price: 49.90,
    originalPrice: 69.90,
    discountPercent: 28,
    rating: 5.0,
    reviewsCount: 88,
    badge: 'Jeans 100% Leve',
    secondaryBadge: 'Mais Vendido',
    images: [
      'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=900&q=80'
    ],
    colors: [
      { name: 'Jeans Médio', hex: '#5A7D9A' },
      { name: 'Jeans Claro', hex: '#8EADC2' }
    ],
    sizes: ['2', '4', '6', '8'],
    inStock: true,
    isComboEligible: true,
    description: 'Denim ecológico super leve com elastano, decote prático e barra dobrada com charme despojado.',
    fabricInfo: '98% Algodão, 2% Elastano Tencel suave.'
  },
  {
    id: 'prod-pijama-doce',
    name: 'Pijama Algodão Doce',
    category: 'infantil',
    subCategory: 'Pijamas',
    ageGroup: '1 a 8 anos',
    price: 39.90,
    originalPrice: 53.00,
    discountPercent: 25,
    rating: 4.7,
    reviewsCount: 65,
    badge: 'Toque Macio',
    secondaryBadge: '-25%',
    images: [
      'https://images.unsplash.com/photo-1543332164-6e82f355badc?auto=format&fit=crop&w=900&q=80'
    ],
    colors: [
      { name: 'Azul Bebê', hex: '#BDD7EE' },
      { name: 'Rosa Candy', hex: '#FAD2E1' },
      { name: 'Cinza Mescla', hex: '#DCDCDC' }
    ],
    sizes: ['P', 'M', 'G'],
    inStock: true,
    isComboEligible: false,
    description: 'Conjunto de pijama de ribana canelada hipoalergênica. O abraço quentinho para a hora de dormir.',
    fabricInfo: '100% Algodão Hipoalergênico.'
  },
  {
    id: 'prod-jardineira-linho',
    name: 'Jardineira Unissex Linho',
    category: 'infantil',
    subCategory: 'Conjuntos',
    ageGroup: '1 a 5 anos',
    price: 49.90,
    originalPrice: 79.90,
    discountPercent: 37,
    rating: 4.9,
    reviewsCount: 112,
    badge: 'Combo 3 por 100',
    secondaryBadge: 'Novo',
    images: [
      'https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?auto=format&fit=crop&w=900&q=80'
    ],
    colors: [
      { name: 'Verde Oliva', hex: '#708238' },
      { name: 'Areia Crua', hex: '#E6DEC9' },
      { name: 'Caramelo', hex: '#C68B59' }
    ],
    sizes: ['1 ano', '2 anos', '3 anos', '4 anos'],
    inStock: true,
    isComboEligible: true,
    description: 'Jardineira clássica em misto de linho e algodão com alças reguláveis e botões frontais rústicos.',
    fabricInfo: '55% Linho, 45% Algodão Puro.'
  },
  {
    id: 'prod-vestido-poa',
    name: 'Vestido Rodado Poá',
    category: 'infantil',
    subCategory: 'Vestidos',
    ageGroup: '2 a 8 anos',
    price: 49.90,
    originalPrice: 75.00,
    discountPercent: 33,
    rating: 4.8,
    reviewsCount: 76,
    badge: 'Retrô Chic',
    secondaryBadge: '-33%',
    images: [
      'https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?auto=format&fit=crop&w=900&q=80'
    ],
    colors: [
      { name: 'Marinho Poá', hex: '#1B263B' },
      { name: 'Vermelho Cereja', hex: '#9E2A2B' }
    ],
    sizes: ['2 anos', '4 anos', '6 anos', '8 anos'],
    inStock: true,
    isComboEligible: true,
    description: 'Vestidinho evasê clássico rodado com estampa de bolinhas poá e cinto laço delicado na cintura.',
    fabricInfo: '100% Algodão Tricoline Acetinado.'
  },
  // Flash Sale Items from Image 8
  {
    id: 'prod-flash-moletom',
    name: 'Conjunto Infantil Moletom',
    category: 'infantil',
    subCategory: 'Inverno',
    price: 49.90,
    originalPrice: 89.90,
    discountPercent: 45,
    rating: 4.9,
    reviewsCount: 154,
    badge: '-45%',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAJGdHuKSkU4bWQSHxfrucws83gfhd4YaNirRN3m9ryFkLc4Uwc118BYKYwAnehF8BVhXOFqogZ7LqB272KkHDXuF3bt2XDPIi6FZD_KerYFfF5vAOdPe1R3U6vJ8e8JGEGSnV9bS2pC13uPzNayZG7lirNgdSiqAwJGd5O7znuVvGpJGyvx2NrEBwqEUHl9acaISPMtWjdL07VUxANGcOdzQFRxULR2MeCvcvVzQWtsflfjX9Tgf2hwQ'
    ],
    colors: [
      { name: 'Rosa Pastel', hex: '#F5CBD6' },
      { name: 'Cinza Mescla', hex: '#DCDCDC' }
    ],
    sizes: ['2', '4', '6', '8'],
    inStock: true,
    isFlashSale: true,
    soldPercentage: 82,
    isComboEligible: false,
    description: 'Moletom felpado quentinho com capuz aconchegante e calça com punho elástico macio.',
    fabricInfo: 'Moletom 3 cabos 80% Algodão, 20% Poliéster.'
  },
  {
    id: 'prod-flash-midi',
    name: 'Vestido Canelado Midi',
    category: 'feminino',
    subCategory: 'Vestidos',
    price: 59.90,
    originalPrice: 99.90,
    discountPercent: 40,
    rating: 4.8,
    reviewsCount: 201,
    badge: '-40%',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAIruHZz1a3GIrYDVDEGl9tfA1eWYRljnPmL2ebrJ5DU8nFzsgcI2KgT81DmlEiJMJmSIitrsyln-EElf1YGnx9-E6ESW7oInLtHYHlrkNwwP7h_zNo1iXfGwCQdOTX0qpdccpMyF83RvBEVelLPy61NUtHTnH-whDpGmY_VOZjklXW3YudnTqE4ndVE94Scx0kr_fzFeRYaohTWuSddxd2_x_8WxL30BKsbhKjc6DG623iW47kfHKYiw'
    ],
    colors: [
      { name: 'Terracota', hex: '#C86D51' },
      { name: 'Preto Clássico', hex: '#1E1E1E' },
      { name: 'Verde Militar', hex: '#4B5320' }
    ],
    sizes: ['P', 'M', 'G', 'GG'],
    inStock: true,
    isFlashSale: true,
    soldPercentage: 65,
    isComboEligible: false,
    description: 'Vestido midi sem mangas com malha canelada premium de alta densidade e fenda lateral sofisticada.',
    fabricInfo: '93% Viscose Vórtex, 7% Elastano.'
  },
  {
    id: 'prod-flash-macaquinho-floral',
    name: 'Macaquinho Algodão Floral',
    category: 'infantil',
    subCategory: 'Macacões',
    price: 39.90,
    originalPrice: 79.90,
    discountPercent: 50,
    rating: 4.9,
    reviewsCount: 97,
    badge: '-50%',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA_tbIw_FYMEtj-iWjY6eQzWU6_WEJiTQVOj20IAisaA0zPz0glWcNyYFso3eH9aP1tIowwdwJqxZXBBZNrKekeCFWi15KR8yPLVPzEdNxbr2CZt3EDSyGVvTZIyahTcFGJOBI1z__RAc57acuVfkeTjA2xGwf32dhEAMowq3Qi6bmpS12u5gt9Z0utSx3nWweggO3J7_-ro1cvu_zV1WkEBD11v00hyS5wl8roaQeUNGMmUzX1rxrlUw'
    ],
    colors: [
      { name: 'Verde Sálvia Floral', hex: '#9CAF88' },
      { name: 'Pêssego Delicado', hex: '#FFDAB9' }
    ],
    sizes: ['1', '2', '3', '4'],
    inStock: true,
    isFlashSale: true,
    soldPercentage: 90,
    isComboEligible: false,
    description: 'Macaquinho leve e fresco com estampa botânica aquarelada, botões no entrepernas para troca rápida.',
    fabricInfo: '100% Algodão Egípcio respirável.'
  },
  // Mais Vendidos Grid from Image 8
  {
    id: 'prod-vestido-bufante',
    name: 'Vestido Floral Manga Bufante',
    category: 'feminino',
    subCategory: 'Vestidos',
    price: 89.90,
    originalPrice: 129.90,
    discountPercent: 30,
    rating: 4.9,
    reviewsCount: 184,
    badge: '-30%',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC8LXUrDvf39AKEIWHvlfzm97K4t5iX68WuBjEzjWnl_QzDYxpPaOc8rUxyr9yZ1yw0HsG0YM2l2NOgQLyxX11XKPAFCf9HPkhq-VEtGObHa9kw7RvpXInJuy5ZZ1wEDD0F5CI4mw2kGCOYmHwy3YJBI2o0rNXAVpu8ARIpu4KxTv_wc993oZW6G6ggqgH3xPMcI5SfQ35HC52h__jp5bcCj5hTCEaNs3cIqjX5-wGWOZTO4HriUFOKBw'
    ],
    colors: [
      { name: 'Floral Jardim Off-white', hex: '#F9F5EC' },
      { name: 'Rosê Suave', hex: '#E7B1A5' }
    ],
    sizes: ['P', 'M', 'G', 'GG'],
    inStock: true,
    isComboEligible: false,
    description: 'Vestido feminino midi com mangas 3/4 bufantes, elástico suave nos ombros e caimento fluido em viscose texturizada.',
    fabricInfo: '100% Viscose Sarjada Premium com forro interno.'
  },
  {
    id: 'prod-kids-verao-algodao',
    name: 'Conjunto Kids Verão Algodão',
    category: 'infantil',
    subCategory: 'Conjuntos',
    ageGroup: '2 a 8 anos',
    price: 69.90,
    originalPrice: 99.90,
    discountPercent: 30,
    rating: 4.8,
    reviewsCount: 92,
    badge: '-30%',
    secondaryBadge: 'Frete Grátis',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC2Nwb5DMeq132B2SXCwFk7yGT2V4_xqKULfQHpDi-z2AzPwUko8kta4YG8iQar2rLY4jM-emYFwMKPaOcn_aRfnRyCTf1Y0H7reODqOLvyXrvUQauHTy5usyYIILd-GYgtjUBxF_F_g8ocTOrlYZHnXL1UEnoAkEaUNq522gZGupfMlQX6EVD8WUt3rpp_cjz0xNF5gwLgU1WvqnxdUS73ygiOG4Bf32VQZk_0_fbyZocEEoPyHF9p2Q'
    ],
    colors: [
      { name: 'Listras Terracota & Off', hex: '#E29578' },
      { name: 'Menta Fresca', hex: '#A8D5BA' }
    ],
    sizes: ['2 anos', '4 anos', '6 anos', '8 anos'],
    inStock: true,
    isComboEligible: true,
    description: 'Conjunto unissex de camiseta canelada e shorts com cordão ajustável em algodão orgânico.',
    fabricInfo: '100% Algodão sustentável orgânico.'
  },
  {
    id: 'prod-blusa-tricot-modal',
    name: 'Blusa Tricot Modal Feminina',
    category: 'feminino',
    subCategory: 'Blusas',
    price: 54.90,
    originalPrice: 79.90,
    discountPercent: 30,
    rating: 5.0,
    reviewsCount: 310,
    badge: '-30%',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAex-_nz3GeA0jf_VuV-LnJLOeGWIebbxPFjP5cBdtOZg4xpXtyBlGYywhjp2nrmXmNcFV7MWW0kv9XTzbdHXmJGq_GHeyFGgso2lWp29sI_cPrSFvkrkWbDUBAZFaYVVDCk6IkvI_ykwAhEc_WTq4dMnmowyOvI96K5xG5IWmycvtnyUlDRNieErTyXhmHzjwy_G0KOlTKEVEycDQrRLss_kdjv5XAYtv4fIz3q_Ai0IlLnTvWndCv3w'
    ],
    colors: [
      { name: 'Bege Amanteigado', hex: '#F0E6D2' },
      { name: 'Terracota', hex: '#C86D51' },
      { name: 'Off White', hex: '#FAF9F6' }
    ],
    sizes: ['P', 'M', 'G', 'GG'],
    inStock: true,
    isComboEligible: true,
    description: 'Blusa feminina em tricot modal canelado com gola redonda clássica, caimento impecável e toque sedoso.',
    fabricInfo: '70% Viscose Modal, 30% Poliamida Soft.'
  },
  {
    id: 'prod-calca-pantalona',
    name: 'Calça Pantalona Fluida',
    category: 'feminino',
    subCategory: 'Calças',
    price: 79.90,
    originalPrice: 119.90,
    discountPercent: 30,
    rating: 4.7,
    reviewsCount: 65,
    badge: '-30%',
    secondaryBadge: 'Frete Grátis',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC_eek6J2q3AT-Fx1NxYAg7Isf_B6OnO6pxC4Ra7kYbJHbogZpfDVc0XDgvbEPIy0ZcZYUZDUEvFfnHv_oFdnnB4WegX4I0cHmKGpvTbSR4qZRh2rIvvenx7HT2anGS7dP0mI-F9_usYxHlU8dNDNbHOblmuPwYJjYm74BsLRQAPfFtIOR-Jt9agOjsLbaCJAHFumM4oatgUk9ZmsBWgdFC6IPH2SFvEXENvACf1AAZf14PpJ8--11RbA'
    ],
    colors: [
      { name: 'Verde Menta', hex: '#A8D5BA' },
      { name: 'Areia Natural', hex: '#E6DEC9' },
      { name: 'Terracota Suave', hex: '#E29578' }
    ],
    sizes: ['P', 'M', 'G', 'GG'],
    inStock: true,
    isComboEligible: false,
    description: 'Pantalona em viscolinho pré-encolhido com cós largo elástico, bolsos laterais e caimento que alonga a silhueta.',
    fabricInfo: '70% Viscose, 30% Linho Brasileiro.'
  }
];

export const INITIAL_CART_ITEMS = [
  {
    id: 'cart-item-1',
    productId: 'prod-vestido-floral',
    name: 'Vestido Floral Infantil',
    image: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=400&q=80',
    price: 49.90,
    originalPrice: 79.90,
    selectedColor: 'Rosê',
    selectedSize: 'M',
    quantity: 1,
    isComboEligible: true,
    comboTag: 'Combo'
  },
  {
    id: 'cart-item-2',
    productId: 'prod-kids-verao-algodao',
    name: 'Conjunto Kids Verão Algodão',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC2Nwb5DMeq132B2SXCwFk7yGT2V4_xqKULfQHpDi-z2AzPwUko8kta4YG8iQar2rLY4jM-emYFwMKPaOcn_aRfnRyCTf1Y0H7reODqOLvyXrvUQauHTy5usyYIILd-GYgtjUBxF_F_g8ocTOrlYZHnXL1UEnoAkEaUNq522gZGupfMlQX6EVD8WUt3rpp_cjz0xNF5gwLgU1WvqnxdUS73ygiOG4Bf32VQZk_0_fbyZocEEoPyHF9p2Q',
    price: 45.00,
    originalPrice: 69.90,
    selectedColor: 'Menta',
    selectedSize: '4 anos',
    quantity: 1,
    isComboEligible: true,
    comboTag: 'Combo'
  },
  {
    id: 'cart-item-3',
    productId: 'prod-blusa-tricot-modal',
    name: 'Blusa Tricot Modal Feminina',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAex-_nz3GeA0jf_VuV-LnJLOeGWIebbxPFjP5cBdtOZg4xpXtyBlGYywhjp2nrmXmNcFV7MWW0kv9XTzbdHXmJGq_GHeyFGgso2lWp29sI_cPrSFvkrkWbDUBAZFaYVVDCk6IkvI_ykwAhEc_WTq4dMnmowyOvI96K5xG5IWmycvtnyUlDRNieErTyXhmHzjwy_G0KOlTKEVEycDQrRLss_kdjv5XAYtv4fIz3q_Ai0IlLnTvWndCv3w',
    price: 54.90,
    originalPrice: 79.90,
    selectedColor: 'Terracota',
    selectedSize: 'G',
    quantity: 1,
    isComboEligible: false
  }
];
