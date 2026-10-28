import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { Product, CartItem, PaymentMethod, ScreenTab, SubScreen, UserProfile, SavedCardItem, DeliveryAddress, StoreSettings } from '../types';
import { INITIAL_CART_ITEMS, PRODUCTS } from '../data/products';
import { auth, googleProvider, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc, collection, onSnapshot } from 'firebase/firestore';
import { erpClient } from '../services/erpClient';
import apiClient from '../services/apiClient';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, color: string, size: string, quantity?: number, variationSku?: string, variationId?: string) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, newQty: number) => void;
  clearCart: () => void;
  
  // Coupon
  appliedCoupon: string | null;
  couponDiscountAmount: number;
  applyCoupon: (code: string) => Promise<boolean> | boolean;
  removeCoupon: () => void;

  // Totals & Combo
  comboCount: number;
  comboItemsNeeded: number;
  comboDiscount: number;
  subtotal: number;
  totalDiscount: number;
  shipping: number;
  total: number;
  pixTotal: number;

  // Favorites
  favorites: string[];
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;

  // Payment
  selectedPayment: PaymentMethod;
  setSelectedPayment: (method: PaymentMethod) => void;

  // Navigation
  currentTab: ScreenTab;
  setCurrentTab: (tab: ScreenTab) => void;
  subScreen: SubScreen;
  setSubScreen: (sub: SubScreen) => void;
  openSubScreen: (sub: SubScreen) => void;
  closeSubScreen: () => void;
  
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  openProductDetail: (product: Product) => void;
  closeProductDetail: () => void;

  // Device Preview Frame (APK Mobile Phone vs Full Web View)
  viewMode: 'mobile' | 'web';
  setViewMode: (mode: 'mobile' | 'web') => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Toast
  toastMessage: string | null;
  showToast: (msg: string) => void;

  // Tech Stack & APK Info Modal
  isTechGuideOpen: boolean;
  setIsTechGuideOpen: (open: boolean) => void;

  // Checkout Modal
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;

  // ERP Checkout & Order Lifecycle (Fase 4)
  currentOrderId: string | null;
  currentOrderNumber: string | null;
  createCheckoutOrder: (paymentMethod?: 'PIX' | 'CREDIT_CARD' | 'BOLETO') => Promise<any>;
  confirmOrderPayment: (paymentData?: { externalPaymentId?: string; paidAt?: string }) => Promise<boolean>;

  // Authentication & User Data
  currentUser: UserProfile | null;
  firebaseAuthUser: User | null;
  isAuthLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  calculateShippingForCep: (cep: string) => Promise<any>;
  logoutUser: () => Promise<void>;

  // Saved Cards
  savedCards: SavedCardItem[];
  saveCreditCard: (card: Omit<SavedCardItem, 'id'>) => Promise<void>;

  // Delivery Addresses (Firestore + ViaCEP)
  addresses: DeliveryAddress[];
  selectedAddressId: string | null;
  selectedAddress: DeliveryAddress | null;
  setSelectedAddressId: (id: string | null) => void;
  saveAddress: (addr: Omit<DeliveryAddress, 'id' | 'createdAt' | 'userId'> & { id?: string }) => Promise<DeliveryAddress>;
  deleteAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;

  // Dynamic Products Catalog (ERP Sincronizado + Fallback Local)
  products: Product[];
  isLoadingProducts: boolean;
  productsError: string | null;
  isSyncedWithErp: boolean;
  fetchProductsFromERP: () => Promise<void>;
  addProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  seedCatalogToFirestore: () => Promise<void>;

  // Store & Merchant Gateway Settings (Mercado Pago, Banco Inter, WhatsApp)
  storeSettings: StoreSettings;
  updateStoreSettings: (settings: Partial<StoreSettings>) => void;
}

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: 'Sagas Brasil Moda',
  whatsappNumber: '5511998765432',
  pixKey: 'juaen.mc@gmail.com',
  pixKeyType: 'email',
  bankName: 'Mercado Pago (MEI)',
  merchantName: 'JUAN JOSE MANCILLA CALLEJAS',
  merchantCity: 'São Paulo',
  mercadoPagoPublicKey: '',
  mercadoPagoAccessToken: '',
  gatewayMode: 'pix_chave'
};

const DEFAULT_PROFILE: UserProfile = {
  uid: 'guest-mariana',
  displayName: 'Mariana Siqueira',
  email: 'mariana.siqueira@email.com',
  photoURL: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtBSCQ0jeRxwpJK2D3r5onszcle4HSKoBa8fk7z3GRmjCbiZSHqDJ1Ayhy3xQNJNrtlKkP8CjMx2NvtmxhtB284p3W0XG4deqP8Tfx13PPFr1DyEt4OtGCeZ0FV1X4RC7OntpZNbMMqZbJ41G1XZj0yxUgLToawzdNbVjqxN-sm1cVWlOo6u-R60m7KsndBo0JZ5hDRY8Dni-HNH8OEni0u1Y5oEjiZjJsDQd1rySGuVNR9hFmf3ho8g',
  isVip: true,
  cashback: 45.00,
  activeOrdersCount: 4,
  couponsCount: 2
};

const DEFAULT_SAVED_CARDS: SavedCardItem[] = [
  {
    id: 'card-default-1',
    brand: 'MASTERCARD',
    last4: '4242',
    holder: 'MARIANA SIQUEIRA',
    expiry: '08/29',
    isDefault: true
  }
];

const DEFAULT_ADDRESSES: DeliveryAddress[] = [
  {
    id: 'addr-default-1',
    userId: 'guest-mariana',
    label: 'Casa',
    recipientName: 'Mariana Siqueira',
    cep: '01310-200',
    street: 'Avenida Paulista',
    number: '1578',
    complement: 'Apto 82',
    neighborhood: 'Bela Vista',
    city: 'São Paulo',
    state: 'SP',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'addr-default-2',
    userId: 'guest-mariana',
    label: 'Trabalho',
    recipientName: 'Mariana Siqueira',
    cep: '04543-011',
    street: 'Avenida Presidente Juscelino Kubitschek',
    number: '1455',
    complement: '4º Andar - Torre Sul',
    neighborhood: 'Itaim Bibi',
    city: 'São Paulo',
    state: 'SP',
    isDefault: false,
    createdAt: new Date().toISOString()
  }
];

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('sagas_cart');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sagas_favorites');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponDiscountAmount, setCouponDiscountAmount] = useState<number>(0);
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('pix');
  const [currentTab, setCurrentTab] = useState<ScreenTab>('home');
  const [subScreen, setSubScreen] = useState<SubScreen>('none');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [viewMode, setViewMode] = useState<'mobile' | 'web'>('web');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isTechGuideOpen, setIsTechGuideOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [currentOrderNumber, setCurrentOrderNumber] = useState<string | null>(null);
  const [currentExternalId, setCurrentExternalId] = useState<string | null>(null);

  // Authentication State (sem dados mockados, com sessão persistente via localStorage e JWT)
  const [firebaseAuthUser, setFirebaseAuthUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('sagas_user');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [savedCards, setSavedCards] = useState<SavedCardItem[]>(() => {
    try {
      const saved = localStorage.getItem('sagas_saved_cards');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Delivery Addresses State (Neon DB + localStorage)
  const [addresses, setAddresses] = useState<DeliveryAddress[]>(() => {
    try {
      const saved = localStorage.getItem('sagas_addresses');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  // Dynamic Products Catalog (ERP Sincronizado + Fallback Local)
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [isSyncedWithErp, setIsSyncedWithErp] = useState<boolean>(false);

  // Store & Merchant Gateway Settings
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem('sagas_store_settings');
      if (saved) return { ...DEFAULT_STORE_SETTINGS, ...JSON.parse(saved) };
    } catch (e) {
      // ignore
    }
    return DEFAULT_STORE_SETTINGS;
  });

  const updateStoreSettings = (newSettings: Partial<StoreSettings>) => {
    setStoreSettings(prev => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem('sagas_store_settings', JSON.stringify(updated));
      } catch (e) {
        // ignore
      }
      return updated;
    });
    showToast('Configurações da loja atualizadas!');
  };

  // Selected Address Helper
  const selectedAddress = useMemo(() => {
    return addresses.find(a => a.id === selectedAddressId) || addresses.find(a => a.isDefault) || addresses[0] || null;
  }, [addresses, selectedAddressId]);


  // Listen to Firebase Auth or local token
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseAuthUser(user);
      if (user) {
        // Authenticated with Google / Firebase
        const userProfile: UserProfile = {
          uid: user.uid,
          displayName: user.displayName || 'Cliente SAGAS',
          email: user.email || '',
          photoURL: user.photoURL || undefined,
          isVip: true,
          cashback: 45.0,
          activeOrdersCount: 0,
          couponsCount: 2
        };
        setCurrentUser(userProfile);
        try {
          localStorage.setItem('sagas_user', JSON.stringify(userProfile));
        } catch {}
      } else {
        // Verify if we have a valid JWT session in localStorage
        const storedToken = localStorage.getItem('sagas_auth_token');
        if (storedToken) {
          apiClient.getMe()
            .then(profile => {
              if (profile && profile.user) {
                const u = profile.user;
                const p: UserProfile = {
                  uid: u.id,
                  displayName: u.name,
                  email: u.email,
                  isVip: true,
                  cashback: 45.0,
                  activeOrdersCount: 0,
                  couponsCount: 2
                };
                setCurrentUser(p);
                localStorage.setItem('sagas_user', JSON.stringify(p));
              }
            })
            .catch(() => {
              // expired or invalid
              localStorage.removeItem('sagas_auth_token');
              localStorage.removeItem('sagas_user');
              setCurrentUser(null);
            });
        }
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sync cart with database when user is authenticated
  useEffect(() => {
    if (!currentUser) return;
    apiClient.getCart()
      .then(items => {
        if (items && items.length > 0) {
          const mapped: CartItem[] = items.map((it: any) => ({
            id: it.id,
            productId: it.productId,
            name: it.product?.title || it.product?.name || 'Peça SAGAS',
            image: it.product?.coverImageUrl || 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=900&q=80',
            price: it.product?.price || 49.9,
            quantity: it.quantity,
            selectedColor: it.variation?.color || 'Padrão',
            selectedSize: it.variation?.size || 'M',
            variationId: it.variationId,
            variationSku: it.variation?.sku
          }));
          setCart(mapped);
          try {
            localStorage.setItem('sagas_cart', JSON.stringify(mapped));
          } catch {}
        }
      })
      .catch(err => console.warn('[CartContext] Erro ao carregar carrinho do Neon DB:', err));

    // Carregar favoritos do Neon DB
    apiClient.getFavorites()
      .then(favs => {
        if (Array.isArray(favs)) {
          const ids = favs.map((f: any) => f.productId || f.id || f);
          setFavorites(ids);
          try {
            localStorage.setItem('sagas_favorites', JSON.stringify(ids));
          } catch {}
        }
      })
      .catch(err => console.warn('[CartContext] Erro ao carregar favoritos do Neon DB:', err));

    // Carregar endereços do Neon DB
    apiClient.getAddresses()
      .then(addrList => {
        if (Array.isArray(addrList) && addrList.length > 0) {
          setAddresses(addrList);
          const def = addrList.find((a: any) => a.isDefault) || addrList[0];
          setSelectedAddressId(def.id);
          try {
            localStorage.setItem('sagas_addresses', JSON.stringify(addrList));
          } catch {}
        }
      })
      .catch(err => console.warn('[CartContext] Erro ao carregar endereços do Neon DB:', err));
  }, [currentUser?.uid]);

  // Persist cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sagas_cart', JSON.stringify(cart));
    } catch {}
  }, [cart]);

  // Persist favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sagas_favorites', JSON.stringify(favorites));
    } catch {}
  }, [favorites]);

  // Sincronização do catálogo com o ERP Backend (com fallback offline)
  const fetchProductsFromERP = async () => {
    setIsLoadingProducts(true);
    setProductsError(null);
    try {
      const erpProducts = await erpClient.getProducts();
      if (erpProducts && erpProducts.length > 0) {
        setProducts(erpProducts);
        setIsSyncedWithErp(true);
        console.info(`[CartContext] Catálogo sincronizado com o ERP (${erpProducts.length} produtos carregados).`);
      } else {
        console.warn('[CartContext] ERP retornou lista vazia ou falhou. Mantendo catálogo estático como fallback.');
        setProducts(PRODUCTS);
        setIsSyncedWithErp(false);
      }
    } catch (err: any) {
      console.warn('[CartContext] Falha ao consultar ERP, usando fallback local:', err?.message);
      setProducts(PRODUCTS);
      setProductsError('Servidor ERP temporariamente indisponível. Exibindo catálogo em cache.');
      setIsSyncedWithErp(false);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProductsFromERP();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const profile: UserProfile = {
        uid: user.uid,
        displayName: user.displayName || 'Cliente SAGAS',
        email: user.email || '',
        photoURL: user.photoURL || undefined,
        isVip: true,
        cashback: 45.0,
        activeOrdersCount: 0,
        couponsCount: 2
      };
      setCurrentUser(profile);
      localStorage.setItem('sagas_user', JSON.stringify(profile));
      showToast(`Bem-vinda(o), ${user.displayName || 'Cliente'}!`);
      setSubScreen('none');
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      showToast('Falha no login com Google. Tente novamente.');
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      const res = await apiClient.loginUser(email, pass);
      if (res && res.user) {
        const u = res.user;
        const profile: UserProfile = {
          uid: u.id,
          displayName: u.name,
          email: u.email,
          isVip: true,
          cashback: 45.0,
          activeOrdersCount: 0,
          couponsCount: 2
        };
        setCurrentUser(profile);
        localStorage.setItem('sagas_user', JSON.stringify(profile));
        showToast(`Bem-vinda de volta, ${u.name}!`);
        setSubScreen('none');
      }
    } catch (err: any) {
      console.error('[CartContext] Login error:', err);
      showToast(err.message || 'Falha no login. Verifique seus dados.');
      throw err;
    }
  };

  const registerWithEmail = async (name: string, email: string, pass: string, phone?: string) => {
    try {
      const res = await apiClient.registerUser(name, email, pass, phone);
      if (res && res.user) {
        const u = res.user;
        const profile: UserProfile = {
          uid: u.id,
          displayName: u.name,
          email: u.email,
          isVip: true,
          cashback: 45.0,
          activeOrdersCount: 0,
          couponsCount: 2
        };
        setCurrentUser(profile);
        localStorage.setItem('sagas_user', JSON.stringify(profile));
        showToast(`Conta criada com sucesso! Bem-vinda, ${u.name}!`);
        setSubScreen('none');
      }
    } catch (err: any) {
      console.error('[CartContext] Register error:', err);
      showToast(err.message || 'Falha ao criar conta. Tente outro e-mail.');
      throw err;
    }
  };

  const calculateShippingForCep = async (cep: string) => {
    try {
      const itemsCount = cart.reduce((acc, it) => acc + it.quantity, 0);
      const res = await apiClient.calculateShipping(cep, subtotal, itemsCount);
      if (res && res.options && res.options.length > 0) {
        setShippingCost(res.options[0].cost);
        return res;
      }
    } catch (err: any) {
      console.warn('[CartContext] Calculate shipping error:', err);
    }
    return null;
  };

  const logoutUser = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      // ignore
    }
    apiClient.logoutLocal();
    setCurrentUser(null);
    setFirebaseAuthUser(null);
    showToast('Sessão encerrada com sucesso.');
  };

  const saveCreditCard = async (newCardData: Omit<SavedCardItem, 'id'>) => {
    const cardId = `card-${Date.now()}`;
    const newCard: SavedCardItem = {
      id: cardId,
      ...newCardData
    };
    setSavedCards(prev => [newCard, ...prev]);

    if (firebaseAuthUser) {
      const path = `users/${firebaseAuthUser.uid}/savedCards/${cardId}`;
      try {
        await setDoc(doc(db, 'users', firebaseAuthUser.uid, 'savedCards', cardId), {
          cardId,
          userId: firebaseAuthUser.uid,
          brand: newCard.brand,
          last4: newCard.last4,
          holder: newCard.holder,
          expiry: newCard.expiry,
          isDefault: newCard.isDefault,
          createdAt: new Date().toISOString()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, path);
      }
    }
    showToast('Cartão salvo com segurança!');
  };

  const saveAddress = async (addrData: Omit<DeliveryAddress, 'id' | 'createdAt' | 'userId'> & { id?: string }): Promise<DeliveryAddress> => {
    const addressId = addrData.id || `addr-${Date.now()}`;
    const uid = firebaseAuthUser?.uid || currentUser?.uid || 'guest-user';
    const newAddress: DeliveryAddress = {
      id: addressId,
      userId: uid,
      label: addrData.label || 'Casa',
      recipientName: addrData.recipientName || currentUser?.displayName || 'Mariana Siqueira',
      cep: addrData.cep,
      street: addrData.street,
      number: addrData.number,
      complement: addrData.complement || '',
      neighborhood: addrData.neighborhood,
      city: addrData.city,
      state: addrData.state,
      isDefault: addrData.isDefault ?? false,
      createdAt: new Date().toISOString()
    };

    setAddresses(prev => {
      let updated = prev.filter(a => a.id !== addressId);
      if (newAddress.isDefault) {
        updated = updated.map(a => ({ ...a, isDefault: false }));
      }
      return [newAddress, ...updated];
    });
    setSelectedAddressId(addressId);

    if (firebaseAuthUser) {
      const path = `users/${firebaseAuthUser.uid}/addresses/${addressId}`;
      try {
        await setDoc(doc(db, 'users', firebaseAuthUser.uid, 'addresses', addressId), {
          addressId,
          userId: firebaseAuthUser.uid,
          label: newAddress.label,
          recipientName: newAddress.recipientName,
          cep: newAddress.cep,
          street: newAddress.street,
          number: newAddress.number,
          complement: newAddress.complement || '',
          neighborhood: newAddress.neighborhood,
          city: newAddress.city,
          state: newAddress.state,
          isDefault: newAddress.isDefault,
          createdAt: newAddress.createdAt
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, path);
      }
    }
    showToast('Endereço salvo com sucesso!');
    return newAddress;
  };

  const deleteAddress = async (id: string) => {
    setAddresses(prev => prev.filter(a => a.id !== id));
    if (selectedAddressId === id) {
      const remaining = addresses.filter(a => a.id !== id);
      setSelectedAddressId(remaining[0]?.id || null);
    }

    if (firebaseAuthUser) {
      const path = `users/${firebaseAuthUser.uid}/addresses/${id}`;
      try {
        await deleteDoc(doc(db, 'users', firebaseAuthUser.uid, 'addresses', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    }
    showToast('Endereço removido');
  };

  const setDefaultAddress = async (id: string) => {
    setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })));
    setSelectedAddressId(id);

    if (firebaseAuthUser) {
      try {
        for (const addr of addresses) {
          const isTarget = addr.id === id;
          await setDoc(
            doc(db, 'users', firebaseAuthUser.uid, 'addresses', addr.id),
            { isDefault: isTarget },
            { merge: true }
          );
        }
      } catch (err) {
        console.warn('Set default address notice:', err);
      }
    }
    showToast('Endereço padrão atualizado!');
  };

  const addProduct = async (newProd: Product) => {
    setProducts(prev => [newProd, ...prev.filter(p => p.id !== newProd.id)]);
    try {
      await setDoc(doc(db, 'products', newProd.id), {
        ...newProd,
        createdAt: new Date().toISOString()
      });
      showToast(`Peça "${newProd.name}" salva no catálogo!`);
    } catch (err) {
      console.warn('Firestore add product notice:', err);
      showToast(`Peça "${newProd.name}" adicionada ao catálogo!`);
    }
  };

  const deleteProduct = async (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    try {
      await deleteDoc(doc(db, 'products', id));
      showToast('Produto removido do catálogo');
    } catch (err) {
      console.warn('Firestore delete product notice:', err);
    }
  };

  const seedCatalogToFirestore = async () => {
    showToast('Sincronizando catálogo com o Firestore...');
    try {
      let count = 0;
      for (const prod of PRODUCTS) {
        await setDoc(doc(db, 'products', prod.id), {
          ...prod,
          createdAt: new Date().toISOString()
        });
        count++;
      }
      showToast(`${count} produtos sincronizados no Firestore!`);
    } catch (err) {
      console.error('Seed catalog error:', err);
      showToast('Erro ao sincronizar catálogo.');
    }
  };

  // Auto-hide toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  const addToCart = (
    product: Product,
    color: string,
    size: string,
    quantity = 1,
    variationSku?: string,
    variationId?: string
  ) => {
    // Resolver SKU e ID da variação
    let targetSku = variationSku;
    let targetVarId = variationId;
    if (product.variations && product.variations.length > 0) {
      const matched = product.variations.find(
        v => (targetSku && v.sku === targetSku) ||
          (v.size?.toLowerCase() === size?.toLowerCase() && v.color?.toLowerCase() === color?.toLowerCase())
      ) || product.variations.find(v => v.size?.toLowerCase() === size?.toLowerCase()) || product.variations[0];

      if (matched) {
        if (!targetSku) targetSku = matched.sku;
        if (!targetVarId) targetVarId = matched.id;
      }
    }

    const existingIndex = cart.findIndex(
      item => (targetSku && item.variationSku === targetSku) ||
        (item.productId === product.id && item.selectedColor === color && item.selectedSize === size)
    );

    const displayName = product.title || product.name;
    const coverImg = product.coverImageUrl || (product.images && product.images.length > 0 ? product.images[0] : 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=900&q=80');

    if (existingIndex > -1) {
      const newCart = [...cart];
      newCart[existingIndex].quantity += quantity;
      if (targetSku) newCart[existingIndex].variationSku = targetSku;
      if (targetVarId) newCart[existingIndex].variationId = targetVarId;
      setCart(newCart);
    } else {
      const newItem: CartItem = {
        id: `cart-${product.id}-${color}-${size}-${targetSku || Date.now()}`,
        productId: product.id,
        name: displayName,
        image: coverImg,
        price: product.price,
        originalPrice: product.originalPrice,
        selectedColor: color,
        selectedSize: size,
        quantity,
        isComboEligible: product.isComboEligible,
        comboTag: product.isComboEligible ? 'Combo' : undefined,
        variationSku: targetSku,
        variationId: targetVarId,
      };
      setCart([...cart, newItem]);
    }
    showToast(`"${displayName}" adicionado à sacola!`);

    // Sincronizar com Neon PostgreSQL se logado
    if (currentUser) {
      apiClient.addCartItem(product.id, targetVarId || product.id, quantity)
        .catch(err => console.warn('[CartContext] Falha ao persistir item no Neon DB:', err));
    }
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(cart.filter(item => item.id !== cartItemId));
    showToast('Item removido do carrinho');
    if (currentUser) {
      apiClient.removeCartItem(cartItemId)
        .catch(err => console.warn('[CartContext] Falha ao remover item do Neon DB:', err));
    }
  };

  const updateQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart(cart.map(item => (item.id === cartItemId ? { ...item, quantity: newQty } : item)));
    if (currentUser) {
      apiClient.updateCartItem(cartItemId, newQty)
        .catch(err => console.warn('[CartContext] Falha ao atualizar quantidade no Neon DB:', err));
    }
  };

  const clearCart = () => {
    setCart([]);
    showToast('Carrinho limpo');
    if (currentUser) {
      apiClient.clearCartDb()
        .catch(err => console.warn('[CartContext] Falha ao limpar carrinho no Neon DB:', err));
    }
  };

  /**
   * B2. Inicia o checkout no ERP criando o pedido e reservando estoque (status: PENDING_PAYMENT)
   */
  const createCheckoutOrder = async (method: 'PIX' | 'CREDIT_CARD' | 'BOLETO' = 'PIX') => {
    if (cart.length === 0) {
      showToast('Carrinho vazio!');
      return null;
    }

    try {
      const extId = currentExternalId || `order-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      if (!currentExternalId) {
        setCurrentExternalId(extId);
      }

      const orderItems = cart.map(item => {
        const prod = products.find(p => p.id === item.productId);
        let varId = item.variationId;
        let varSku = item.variationSku;

        if (prod && prod.variations && prod.variations.length > 0) {
          const matched = prod.variations.find(v => 
            (varSku && v.sku === varSku) ||
            (v.size?.toLowerCase() === item.selectedSize?.toLowerCase() &&
             v.color?.toLowerCase() === item.selectedColor?.toLowerCase())
          ) || prod.variations.find(v => v.size?.toLowerCase() === item.selectedSize?.toLowerCase()) || prod.variations[0];

          if (matched) {
            varId = matched.id;
            varSku = matched.sku;
          }
        }

        return {
          variationSku: varSku || varId || item.productId,
          variationId: varId || item.productId,
          quantity: item.quantity,
          unitPrice: item.price
        };
      });

      const customerPayload = {
        firebaseUid: firebaseAuthUser?.uid || currentUser?.uid || 'guest-mariana',
        name: currentUser?.displayName || firebaseAuthUser?.displayName || 'Mariana Silva',
        email: currentUser?.email || firebaseAuthUser?.email || 'mariana@sagas.moda',
        phone: '11998765432',
        address: selectedAddress
      };

      const result = await erpClient.createOrder({
        externalId: extId,
        channel: 'APP_SAGAS',
        customer: customerPayload,
        items: orderItems,
        subtotal: Math.round(subtotal * 100) / 100,
        shipping: { cost: 0, method: 'CORREIOS_PAC' },
        total: Math.round(total * 100) / 100,
        paymentMethod: method,
        couponCode: appliedCoupon || undefined
      });

      if (result && result.orderId) {
        setCurrentOrderId(result.orderId);
        setCurrentOrderNumber(result.orderNumber);
        return result;
      }
      throw new Error(result?.message || 'Erro ao criar pedido no ERP');
    } catch (err: any) {
      console.error('[CartContext.createCheckoutOrder] Erro:', err);
      showToast(err.message || 'Erro ao criar pedido no ERP');
      throw err;
    }
  };

  /**
   * B2. Confirma o pagamento no ERP (status: PAID) e realiza a baixa definitiva de estoque
   */
  const confirmOrderPayment = async (paymentData: { externalPaymentId?: string; paidAt?: string } = {}) => {
    if (!currentOrderId) {
      console.warn('[CartContext.confirmOrderPayment] Nenhum pedido ativo para confirmar no momento.');
      return false;
    }

    try {
      await erpClient.confirmPayment(currentOrderId, paymentData);
      showToast(`Pedido ${currentOrderNumber || ''} aprovado com sucesso!`);
      clearCart();
      setCurrentExternalId(null);
      return true;
    } catch (err: any) {
      console.error('[CartContext.confirmOrderPayment] Erro:', err);
      showToast('Falha ao confirmar pagamento no ERP');
      return false;
    }
  };

  const toggleFavorite = async (productId: string) => {
    const exists = favorites.includes(productId);
    const updated = exists ? favorites.filter(id => id !== productId) : [...favorites, productId];
    setFavorites(updated);
    showToast(exists ? 'Removido dos favoritos' : 'Salvo nos favoritos!');
    if (currentUser) {
      try {
        if (exists) {
          await apiClient.removeFavorite(productId);
        } else {
          await apiClient.addFavorite(productId);
        }
      } catch (e) {
        console.warn('[CartContext] Falha ao sincronizar favorito com banco:', e);
      }
    }
  };

  const isFavorite = (productId: string) => favorites.includes(productId);

  const applyCoupon = async (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    try {
      const res = await apiClient.validateCoupon(cleanCode, subtotal);
      if (res && res.valid) {
        setAppliedCoupon(cleanCode);
        setCouponDiscountAmount(res.discountAmount || 0);
        showToast(`Cupom ${cleanCode} aplicado com sucesso! Desconto: R$ ${(res.discountAmount || 0).toFixed(2)}`);
        return true;
      } else {
        showToast(res?.message || 'Cupom inválido ou requisitos não atendidos');
        return false;
      }
    } catch (err: any) {
      // Local fallback for offline/demo coupons
      if (['BEMVINDA10', 'BEMVINDA', 'SAGAS15', 'VIP20'].includes(cleanCode)) {
        setAppliedCoupon(cleanCode);
        const disc = cleanCode.includes('15') ? 15 : cleanCode.includes('20') ? 20 : 10;
        setCouponDiscountAmount(disc);
        showToast(`Cupom ${cleanCode} aplicado!`);
        return true;
      }
      showToast('Cupom inválido ou expirado');
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscountAmount(0);
    showToast('Cupom removido');
  };

  const openProductDetail = (product: Product) => {
    setSelectedProduct(product);
  };

  const closeProductDetail = () => {
    setSelectedProduct(null);
  };

  const openSubScreen = (sub: SubScreen) => {
    setSubScreen(sub);
  };

  const closeSubScreen = () => {
    setSubScreen('none');
  };

  // Calculations
  const { subtotal, comboCount, comboItemsNeeded, comboDiscount, totalDiscount, total, pixTotal } = useMemo(() => {
    let sub = 0;
    let comboEligiblePieces = 0;

    cart.forEach(item => {
      sub += item.price * item.quantity;
      if (item.isComboEligible) {
        comboEligiblePieces += item.quantity;
      }
    });

    const fullCombos = Math.floor(comboEligiblePieces / 3);
    const piecesInRemainingCombo = comboEligiblePieces % 3;
    const itemsNeeded = piecesInRemainingCombo === 0 ? (comboEligiblePieces === 0 ? 3 : 0) : 3 - piecesInRemainingCombo;

    let cDiscount = 0;
    if (fullCombos > 0) {
      cDiscount = fullCombos * 15.00;
    } else if (comboEligiblePieces >= 2) {
      cDiscount = 14.82;
    }

    const tDiscount = cDiscount + couponDiscountAmount;
    const finalTotal = Math.max(0, sub - tDiscount + shippingCost);
    const pixVal = finalTotal * 0.95;

    return {
      subtotal: sub,
      comboCount: comboEligiblePieces,
      comboItemsNeeded: itemsNeeded,
      comboDiscount: cDiscount,
      totalDiscount: tDiscount,
      total: finalTotal,
      pixTotal: pixVal
    };
  }, [cart, couponDiscountAmount, shippingCost]);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        appliedCoupon,
        couponDiscountAmount,
        applyCoupon,
        removeCoupon,
        comboCount,
        comboItemsNeeded,
        comboDiscount,
        subtotal,
        totalDiscount,
        shipping: 0,
        total,
        pixTotal,
        favorites,
        toggleFavorite,
        isFavorite,
        selectedPayment,
        setSelectedPayment,
        currentTab,
        setCurrentTab,
        subScreen,
        setSubScreen,
        openSubScreen,
        closeSubScreen,
        selectedProduct,
        setSelectedProduct,
        openProductDetail,
        closeProductDetail,
        viewMode,
        setViewMode,
        searchQuery,
        setSearchQuery,
        toastMessage,
        showToast,
        isTechGuideOpen,
        setIsTechGuideOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        currentUser,
        firebaseAuthUser,
        isAuthLoading,
        loginWithGoogle,
        logoutUser,
        savedCards,
        saveCreditCard,
        addresses,
        selectedAddressId,
        selectedAddress,
        setSelectedAddressId,
        saveAddress,
        deleteAddress,
        setDefaultAddress,
        currentOrderId,
        currentOrderNumber,
        createCheckoutOrder,
        confirmOrderPayment,
        products,
        isLoadingProducts,
        productsError,
        isSyncedWithErp,
        fetchProductsFromERP,
        addProduct,
        deleteProduct,
        seedCatalogToFirestore,
        storeSettings,
        updateStoreSettings
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
