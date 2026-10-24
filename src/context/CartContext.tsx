import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { Product, CartItem, PaymentMethod, ScreenTab, SubScreen, UserProfile, SavedCardItem, DeliveryAddress, StoreSettings } from '../types';
import { INITIAL_CART_ITEMS, PRODUCTS } from '../data/products';
import { auth, googleProvider, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc, collection, onSnapshot } from 'firebase/firestore';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, color: string, size: string, quantity?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, newQty: number) => void;
  clearCart: () => void;
  
  // Coupon
  appliedCoupon: string | null;
  couponDiscountAmount: number;
  applyCoupon: (code: string) => boolean;
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

  // Toast
  toastMessage: string | null;
  showToast: (msg: string) => void;

  // Tech Stack & APK Info Modal
  isTechGuideOpen: boolean;
  setIsTechGuideOpen: (open: boolean) => void;

  // Checkout Modal
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;

  // Authentication & User Data
  currentUser: UserProfile | null;
  firebaseAuthUser: User | null;
  isAuthLoading: boolean;
  loginWithGoogle: () => Promise<void>;
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

  // Dynamic Products Catalog (Firestore)
  products: Product[];
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
  const [cart, setCart] = useState<CartItem[]>(INITIAL_CART_ITEMS);
  const [favorites, setFavorites] = useState<string[]>([
    'prod-vestido-floral',
    'prod-macaquinho-jeans',
    'prod-safari-shorts',
    'prod-blusa-tricot-modal',
    'prod-jardineira-linho'
  ]);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>('BEMVINDA10');
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('pix');
  const [currentTab, setCurrentTab] = useState<ScreenTab>('home');
  const [subScreen, setSubScreen] = useState<SubScreen>('none');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [viewMode, setViewMode] = useState<'mobile' | 'web'>('mobile');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isTechGuideOpen, setIsTechGuideOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Authentication State
  const [firebaseAuthUser, setFirebaseAuthUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(DEFAULT_PROFILE);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [savedCards, setSavedCards] = useState<SavedCardItem[]>(DEFAULT_SAVED_CARDS);

  // Delivery Addresses State (Firestore + ViaCEP)
  const [addresses, setAddresses] = useState<DeliveryAddress[]>(DEFAULT_ADDRESSES);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>('addr-default-1');

  // Dynamic Products Catalog (Firestore)
  const [products, setProducts] = useState<Product[]>(PRODUCTS);

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

  // Listen to Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseAuthUser(user);
      if (user) {
        // Authenticated with Google / Firebase
        const userRef = doc(db, 'users', user.uid);
        try {
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            const data = snap.data();
            setCurrentUser({
              uid: user.uid,
              displayName: user.displayName || data.name || 'Cliente SAGAS',
              email: user.email,
              photoURL: user.photoURL || data.photoURL,
              isVip: true,
              cashback: data.cashbackBalance ?? 45.0,
              activeOrdersCount: 4,
              couponsCount: 2
            });
          } else {
            // First time Google Sign In - persist to Firestore
            const newProfile: UserProfile = {
              uid: user.uid,
              displayName: user.displayName || 'Cliente SAGAS',
              email: user.email,
              photoURL: user.photoURL,
              isVip: true,
              cashback: 45.0,
              activeOrdersCount: 4,
              couponsCount: 2
            };
            await setDoc(userRef, {
              userId: user.uid,
              name: user.displayName || 'Cliente SAGAS',
              email: user.email,
              photoURL: user.photoURL || '',
              vipLevel: 'Cliente VIP Ouro',
              cashbackBalance: 45.0,
              createdAt: new Date().toISOString()
            });
            setCurrentUser(newProfile);
          }
        } catch (err) {
          console.warn('Firestore user fetch notice:', err);
          setCurrentUser({
            uid: user.uid,
            displayName: user.displayName || 'Cliente SAGAS',
            email: user.email,
            photoURL: user.photoURL,
            isVip: true,
            cashback: 45.0,
            activeOrdersCount: 4,
            couponsCount: 2
          });
        }
      } else {
        // Fallback default demo profile (Mariana Siqueira)
        setCurrentUser(DEFAULT_PROFILE);
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Listen for Saved Cards when authenticated
  useEffect(() => {
    if (!firebaseAuthUser) return;
    const cardsPath = `users/${firebaseAuthUser.uid}/savedCards`;
    const unsubscribe = onSnapshot(
      collection(db, 'users', firebaseAuthUser.uid, 'savedCards'),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded: SavedCardItem[] = snapshot.docs.map(d => ({
            id: d.id,
            ...(d.data() as any)
          }));
          setSavedCards(loaded);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, cardsPath);
      }
    );
    return () => unsubscribe();
  }, [firebaseAuthUser]);

  // Listen for Delivery Addresses in Firestore when authenticated
  useEffect(() => {
    if (!firebaseAuthUser) return;
    const addressesPath = `users/${firebaseAuthUser.uid}/addresses`;
    const unsubscribe = onSnapshot(
      collection(db, 'users', firebaseAuthUser.uid, 'addresses'),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded: DeliveryAddress[] = snapshot.docs.map(d => ({
            id: d.id,
            ...(d.data() as any)
          }));
          setAddresses(loaded);
          const defaultItem = loaded.find(a => a.isDefault);
          if (defaultItem) {
            setSelectedAddressId(defaultItem.id);
          } else if (loaded.length > 0) {
            setSelectedAddressId(loaded[0].id);
          }
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, addressesPath);
      }
    );
    return () => unsubscribe();
  }, [firebaseAuthUser]);

  // Listen for Dynamic Catalog Products in Firestore
  useEffect(() => {
    const productsPath = 'products';
    const unsubscribe = onSnapshot(
      collection(db, 'products'),
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteProducts: Product[] = snapshot.docs.map(d => ({
            id: d.id,
            ...(d.data() as any)
          }));
          // Merge remote products with preset PRODUCTS, prioritizing remote
          const merged = [...remoteProducts];
          for (const staticProd of PRODUCTS) {
            if (!merged.some(m => m.id === staticProd.id)) {
              merged.push(staticProd);
            }
          }
          setProducts(merged);
        }
      },
      (error) => {
        // If collection not created yet, default static PRODUCTS remain active
        console.info('Firestore products sync:', error.message);
      }
    );
    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      showToast(`Bem-vinda(o), ${result.user.displayName || 'Cliente'}!`);
      setSubScreen('none');
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      showToast('Falha no login com Google. Tente novamente.');
    }
  };

  const logoutUser = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      showToast('Sessão encerrada com sucesso.');
    } catch (err) {
      console.error('Logout error:', err);
    }
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

  const addToCart = (product: Product, color: string, size: string, quantity = 1) => {
    const existingIndex = cart.findIndex(
      item => item.productId === product.id && item.selectedColor === color && item.selectedSize === size
    );

    if (existingIndex > -1) {
      const newCart = [...cart];
      newCart[existingIndex].quantity += quantity;
      setCart(newCart);
    } else {
      const newItem: CartItem = {
        id: `cart-${product.id}-${color}-${size}-${Date.now()}`,
        productId: product.id,
        name: product.name,
        image: product.images[0],
        price: product.price,
        originalPrice: product.originalPrice,
        selectedColor: color,
        selectedSize: size,
        quantity,
        isComboEligible: product.isComboEligible,
        comboTag: product.isComboEligible ? 'Combo' : undefined
      };
      setCart([...cart, newItem]);
    }
    showToast(`"${product.name}" adicionado à sacola!`);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(cart.filter(item => item.id !== cartItemId));
    showToast('Item removido do carrinho');
  };

  const updateQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart(cart.map(item => (item.id === cartItemId ? { ...item, quantity: newQty } : item)));
  };

  const clearCart = () => {
    setCart([]);
    showToast('Carrinho limpo');
  };

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => {
      const exists = prev.includes(productId);
      const updated = exists ? prev.filter(id => id !== productId) : [...prev, productId];
      showToast(exists ? 'Removido dos favoritos' : 'Salvo nos favoritos!');
      return updated;
    });
  };

  const isFavorite = (productId: string) => favorites.includes(productId);

  const applyCoupon = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === 'BEMVINDA10' || cleanCode === 'BEMVINDA' || cleanCode === 'SAGAS10' || cleanCode === 'VERAO2025') {
      setAppliedCoupon(cleanCode);
      showToast(`Cupom ${cleanCode} aplicado com sucesso!`);
      return true;
    }
    showToast('Cupom inválido ou expirado');
    return false;
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
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
  const { subtotal, comboCount, comboItemsNeeded, comboDiscount, couponDiscountAmount, totalDiscount, total, pixTotal } = useMemo(() => {
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

    let couponDiscount = 0;
    if (appliedCoupon) {
      couponDiscount = 14.98;
    }

    const tDiscount = cDiscount + couponDiscount;
    const finalTotal = Math.max(0, sub - tDiscount);
    const pixVal = finalTotal * 0.95;

    return {
      subtotal: sub,
      comboCount: comboEligiblePieces,
      comboItemsNeeded: itemsNeeded,
      comboDiscount: cDiscount,
      couponDiscountAmount: couponDiscount,
      totalDiscount: tDiscount,
      total: finalTotal,
      pixTotal: pixVal
    };
  }, [cart, appliedCoupon]);

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
        products,
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
