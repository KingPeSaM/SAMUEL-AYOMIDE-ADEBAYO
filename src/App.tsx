/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home, ShoppingBag, Instagram, ChevronRight, ChevronLeft, Star, Heart, Leaf, User, Menu, X, LogIn, LogOut, ShieldCheck, Plus, Minus, Trash2, ShoppingCart } from 'lucide-react';
import { 
  db, 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  collection, 
  addDoc, 
  deleteDoc, 
  updateDoc,
  doc, 
  onSnapshot, 
  query, 
  orderBy,
  limit,
  Timestamp,
  handleFirestoreError,
  OperationType
} from './firebase';
import { Product, Page, CartItem } from './types';
import AdminDashboard from './components/AdminDashboard';

// --- Constants ---
const CATEGORIES = [
  { id: 'all', name: 'All Products' },
  { id: 'crochet', name: 'Crochet Scrunchies' },
  { id: 'fabric', name: 'Fabric Scrunchies' },
  { id: 'headbands', name: 'Headbands' },
  { id: 'alice', name: 'Alice Bands' },
  { id: 'clips', name: 'Claw Clips' },
  { id: 'earrings', name: 'Earrings' }
];

// --- Components ---

const ProductCard = ({ product, onAddToCart }: { product: Product; onAddToCart: (p: Product) => void; key?: string }) => {
  const imageUrl = product.imageUrl || `https://picsum.photos/seed/${encodeURIComponent(product.name)}/600/600`;
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-[32px] overflow-hidden shadow-[0_4px_20px_rgba(192,19,44,0.04)] hover:shadow-[0_24px_64px_rgba(192,19,44,0.12)] transition-all duration-500 group border border-[#C0132C]/5 flex flex-col h-full"
    >
      <div className="h-[280px] bg-[#FAF0F0] relative overflow-hidden flex-shrink-0">
        <img 
          src={imageUrl} 
          alt={product.name}
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${encodeURIComponent(product.name)}/600/600`;
          }}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#8B0A2A]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {product.badge && (
          <div className="absolute top-5 left-5 z-10">
            <span
              className="text-[0.6rem] font-bold tracking-[0.2em] uppercase text-white px-4 py-1.5 rounded-full shadow-lg backdrop-blur-md"
              style={{ backgroundColor: product.badgeColor || '#C0132C' }}
            >
              {product.badge}
            </span>
          </div>
        )}

        <button 
          onClick={() => onAddToCart(product)}
          className="absolute bottom-5 right-5 w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#C0132C] shadow-xl translate-y-20 group-hover:translate-y-0 transition-all duration-500 hover:bg-[#C0132C] hover:text-white active:scale-90"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="p-7 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[0.65rem] text-[#C0132C] font-bold uppercase tracking-[0.2em] opacity-60">
            {product.category}
          </span>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} size={10} className="fill-[#C0132C] text-[#C0132C]" />
            ))}
          </div>
        </div>
        
        <h3 className="font-serif text-[1.25rem] font-medium mb-2 text-[#1A1A1A] leading-tight group-hover:text-[#C0132C] transition-colors line-clamp-1">
          {product.name}
        </h3>
        
        <p className="text-[0.85rem] text-[#7a5a5a] leading-relaxed mb-6 line-clamp-2 opacity-80">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between pt-4 border-t border-[#C0132C]/5 mt-auto">
          <div className="flex flex-col">
            <span className="text-[0.6rem] text-[#7a5a5a] uppercase tracking-widest font-bold opacity-40">Price</span>
            <span className="font-serif text-[1.5rem] text-[#8B0A2A] font-bold">₦{product.price.toLocaleString()}</span>
          </div>
          <button
            onClick={() => onAddToCart(product)}
            className="bg-[#C0132C] hover:bg-[#8B0A2A] text-white px-5 py-2.5 rounded-xl text-[0.7rem] font-bold tracking-widest uppercase transition-all active:scale-95 shadow-lg shadow-[#C0132C]/10"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const ProductCarousel = ({ products, onAddToCart }: { products: Product[]; onAddToCart: (p: Product) => void }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsToShow, setItemsToShow] = useState(4);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setItemsToShow(1);
      else if (window.innerWidth < 1024) setItemsToShow(2);
      else setItemsToShow(4);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, products.length - itemsToShow);

  const next = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  if (products.length === 0) return null;

  return (
    <div className="relative group max-w-[1200px] mx-auto px-4 md:px-10">
      <div className="overflow-hidden py-8">
        <motion.div
          className="flex"
          animate={{ x: `-${currentIndex * (100 / itemsToShow)}%` }}
          transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        >
          {products.map((product) => (
            <div 
              key={product.id} 
              className="flex-shrink-0 px-3" 
              style={{ width: `${100 / itemsToShow}%` }}
            >
              <ProductCard product={product} onAddToCart={onAddToCart} />
            </div>
          ))}
        </motion.div>
      </div>

      {/* Navigation Arrows */}
      {products.length > itemsToShow && (
        <>
          <button
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white shadow-xl rounded-full p-3 text-[#C0132C] hover:bg-[#C0132C] hover:text-white transition-all opacity-0 group-hover:opacity-100 z-20 -ml-4 md:-ml-6"
            aria-label="Previous product"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white shadow-xl rounded-full p-3 text-[#C0132C] hover:bg-[#C0132C] hover:text-white transition-all opacity-0 group-hover:opacity-100 z-20 -mr-4 md:-mr-6"
            aria-label="Next product"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Indicators */}
      <div className="flex justify-center gap-2.5 mt-4">
        {Array.from({ length: maxIndex + 1 }).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`h-1.5 rounded-full transition-all duration-500 ${currentIndex === i ? 'w-10 bg-[#C0132C]' : 'w-2 bg-[#C0132C]/20 hover:bg-[#C0132C]/40'}`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

const CartDrawer = ({ 
  cart, 
  isOpen, 
  onClose, 
  onUpdateQuantity, 
  onRemoveItem,
  onCheckout,
  onStartShopping
}: { 
  cart: CartItem[]; 
  isOpen: boolean; 
  onClose: () => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
  onStartShopping: () => void;
}) => {
  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-[480px] bg-[#FAF0F0] shadow-2xl z-[201] flex flex-col"
          >
            {/* Header */}
            <div className="p-8 flex items-center justify-between border-b border-[#C0132C]/5 bg-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#FAF0F0] flex items-center justify-center text-[#C0132C]">
                  <ShoppingCart size={24} />
                </div>
                <div>
                  <h3 className="font-serif text-2xl text-[#8B0A2A] font-light tracking-tight">Your Cart</h3>
                  <p className="text-[0.7rem] text-[#7a5a5a] uppercase tracking-[0.15em] font-medium">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)} Items Selected
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="w-10 h-10 flex items-center justify-center hover:bg-[#FAF0F0] rounded-full text-[#7a5a5a] transition-all active:scale-90"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-10">
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-32 h-32 rounded-full bg-white flex items-center justify-center mb-8 shadow-xl shadow-[#C0132C]/5"
                  >
                    <ShoppingCart size={48} className="text-[#C0132C]/20" />
                  </motion.div>
                  <h4 className="font-serif text-2xl text-[#8B0A2A] mb-3">Your cart is empty</h4>
                  <p className="text-[#7a5a5a] text-sm leading-relaxed mb-8">
                    It looks like you haven't added any Starlight accessories yet. Let's find something beautiful for your hair.
                  </p>
                  <button 
                    onClick={onStartShopping}
                    className="bg-[#C0132C] text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-[#C0132C]/20 hover:scale-105 transition-transform active:scale-95"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item, idx) => (
                    <motion.div 
                      key={item.product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-white p-4 rounded-3xl flex gap-5 shadow-sm border border-[#C0132C]/5 group hover:shadow-md transition-shadow"
                    >
                      <div className="w-24 h-24 rounded-2xl bg-[#FAF0F0] overflow-hidden flex-shrink-0 relative">
                        <img 
                          src={item.product.imageUrl || `https://picsum.photos/seed/${item.product.name.replace(/\s+/g, '-')}/200/200`} 
                          alt={item.product.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                        <div>
                          <div className="flex justify-between items-start">
                            <h4 className="font-serif text-[1.15rem] font-medium text-[#1A1A1A] leading-tight truncate pr-4">
                              {item.product.name}
                            </h4>
                            <button 
                              onClick={() => onRemoveItem(item.product.id)}
                              className="text-[#aaa] hover:text-[#C0132C] transition-colors p-1"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <p className="text-[0.85rem] text-[#C0132C] font-semibold mt-1">
                            ₦{item.product.price.toLocaleString()}
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-4 bg-[#FAF0F0] rounded-xl px-3 py-1.5">
                            <button 
                              onClick={() => onUpdateQuantity(item.product.id, -1)}
                              className="text-[#C0132C] hover:bg-white rounded-lg p-1 transition-all active:scale-75 disabled:opacity-30"
                              disabled={item.quantity <= 1}
                            >
                              <Minus size={14} />
                            </button>
                            <span className="font-mono font-bold text-[#1A1A1A] min-w-[1.5rem] text-center text-sm">
                              {item.quantity}
                            </span>
                            <button 
                              onClick={() => onUpdateQuantity(item.product.id, 1)}
                              className="text-[#C0132C] hover:bg-white rounded-lg p-1 transition-all active:scale-75"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <span className="font-serif font-bold text-[#1A1A1A]">
                            ₦{(item.product.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="p-8 bg-white border-t border-[#C0132C]/5 space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[#7a5a5a]">
                    <span className="text-xs uppercase tracking-[0.2em] font-bold">Subtotal</span>
                    <span className="font-mono font-bold">₦{total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-[#7a5a5a]">
                    <span className="text-xs uppercase tracking-[0.2em] font-bold">Shipping</span>
                    <span className="text-xs font-medium italic">Calculated at checkout</span>
                  </div>
                  <div className="h-px bg-gradient-to-r from-transparent via-[#C0132C]/10 to-transparent my-4" />
                  <div className="flex justify-between items-center">
                    <span className="font-serif text-xl text-[#8B0A2A]">Total Amount</span>
                    <span className="font-serif text-3xl font-bold text-[#C0132C]">₦{total.toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <button
                    onClick={onCheckout}
                    className="w-full bg-[#25D366] hover:bg-[#1aad53] text-white py-5 rounded-2xl font-bold tracking-[0.15em] uppercase flex items-center justify-center gap-3 shadow-xl shadow-[#25D366]/20 transition-all hover:-translate-y-1 active:translate-y-0 active:scale-[0.98]"
                  >
                    <ShoppingBag size={20} />
                    Complete Order
                  </button>
                  <div className="flex items-center justify-center gap-2 text-[0.65rem] text-[#7a5a5a] uppercase tracking-widest font-bold opacity-60">
                    <ShieldCheck size={12} />
                    Secure Checkout via WhatsApp
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [scrolled, setScrolled] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [asyncError, setAsyncError] = useState<Error | null>(null);
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('starlight_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('starlight_cart', JSON.stringify(cart));
  }, [cart]);

  if (asyncError) {
    throw asyncError;
  }

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    
    // Auth listener
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAdmin(currentUser?.email === 'adebayosam3249@gmail.com' || currentUser?.email === 'dopamuexcel@gmail.com');
    });

    // Products listener
    setIsLoadingProducts(true);
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(50));
    const unsubscribeProducts = onSnapshot(q, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setProducts(productsData);
      setIsLoadingProducts(false);
    }, (error) => {
      setIsLoadingProducts(false);
      setAsyncError(error instanceof Error ? error : new Error(JSON.stringify(error)));
      handleFirestoreError(error, OperationType.LIST, 'products');
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      unsubscribeAuth();
      unsubscribeProducts();
    };
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentPage('home');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt'>) => {
    try {
      await addDoc(collection(db, 'products'), {
        ...productData,
        createdAt: Timestamp.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'products');
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
    }
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    try {
      await updateDoc(doc(db, 'products', id), productData);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `products/${id}`);
    }
  };

  const navigateTo = (page: Page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.product.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const handleCheckout = () => {
    const itemsList = cart.map(item => 
      `• ${item.product.name} (${item.quantity}x) - ₦${(item.product.price * item.quantity).toLocaleString()}`
    ).join('\n');
    
    const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    
    const msg = `Hi Starlight Accessories! 👋 I'd like to place an order:\n\n${itemsList}\n\n*Total: ₦${total.toLocaleString()}*\n\nPlease confirm availability and share payment details. Thank you! 💖`;
    
    window.open(`https://wa.me/2348149783549?text=${encodeURIComponent(msg)}`, '_blank');
    setCart([]);
    setIsCartOpen(false);
  };

  const scrollToAbout = () => {
    navigateTo('home');
    setTimeout(() => {
      document.getElementById('about-anchor')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-[#FAF0F0] text-[#1A1A1A] font-sans selection:bg-[#C0132C] selection:text-white">
      {/* --- Navigation --- */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-4 md:px-12 py-2 md:py-3 transition-all duration-300 ${scrolled ? 'bg-[#FAF0F0]/94 backdrop-blur-lg shadow-[0_4px_30px_rgba(192,19,44,0.08)] border-b border-[#C0132C]/10' : 'bg-transparent'}`}>
        <button onClick={() => navigateTo('home')} className="flex items-center group flex-shrink-0">
          <img 
            src="https://lh3.googleusercontent.com/d/18VbOSt3BhA0VVDM6E2vRgRj04RgLAkEz" 
            alt="Starlight Accessories" 
            className="h-[50px] md:h-[76px] w-auto object-contain cursor-pointer rounded-full"
            referrerPolicy="no-referrer"
          />
        </button>

        {/* Navigation Links */}
        <ul className="flex gap-3 md:gap-8 list-none items-center">
          <li>
            <button
              onClick={() => navigateTo('home')}
              className={`text-[0.75rem] md:text-[0.82rem] font-medium tracking-[0.06em] uppercase transition-colors relative group p-1 ${currentPage === 'home' ? 'text-[#C0132C]' : 'text-[#1A1A1A] hover:text-[#C0132C]'}`}
            >
              <span className="hidden md:inline">home</span>
              <Home className="md:hidden w-5 h-5" />
              <span className={`absolute -bottom-1 left-0 right-0 h-0.5 bg-[#C0132C] rounded-full transition-transform duration-250 ${currentPage === 'home' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
            </button>
          </li>
          <li>
            <button
              onClick={() => navigateTo('shop')}
              className={`text-[0.75rem] md:text-[0.82rem] font-medium tracking-[0.06em] uppercase transition-colors relative group p-1 ${currentPage === 'shop' ? 'text-[#C0132C]' : 'text-[#1A1A1A] hover:text-[#C0132C]'}`}
            >
              <span className="hidden md:inline">shop</span>
              <ShoppingBag className="md:hidden w-5 h-5" />
              <span className={`absolute -bottom-1 left-0 right-0 h-0.5 bg-[#C0132C] rounded-full transition-transform duration-250 ${currentPage === 'shop' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
            </button>
          </li>
          
          {isAdmin && (
            <li className="hidden sm:block">
              <button
                onClick={() => navigateTo('admin')}
                className={`text-[0.75rem] md:text-[0.82rem] font-medium tracking-[0.06em] uppercase transition-colors relative group flex items-center gap-1 ${currentPage === 'admin' ? 'text-[#C0132C]' : 'text-[#1A1A1A] hover:text-[#C0132C]'}`}
              >
                <ShieldCheck className="w-3.5 h-3.5 md:w-[14px] md:h-[14px]" />
                <span className="hidden md:inline">Admin</span>
                <span className={`absolute -bottom-1 left-0 right-0 h-0.5 bg-[#C0132C] rounded-full transition-transform duration-250 ${currentPage === 'admin' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
              </button>
            </li>
          )}
          
          <li>
            <button
              onClick={() => setIsCartOpen(true)}
              className="p-1.5 md:p-2.5 text-[#1A1A1A] hover:text-[#C0132C] transition-all relative group active:scale-90"
            >
              <ShoppingCart className="w-5 h-5 md:w-[22px] md:h-[22px] group-hover:scale-110 transition-transform" />
              {cart.length > 0 && (
                <span className="absolute top-0 md:top-1.5 right-0 md:right-1.5 bg-[#C0132C] text-white text-[0.55rem] md:text-[0.6rem] font-bold w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm group-hover:-translate-y-0.5 transition-transform">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>
          </li>
          
          <li>
            <button
              onClick={() => navigateTo('shop')}
              className="bg-[#C0132C] hover:bg-[#8B0A2A] text-white px-3 md:px-5 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[0.65rem] md:text-[0.82rem] font-medium tracking-[0.06em] uppercase transition-all shadow-lg shadow-[#C0132C]/20 whitespace-nowrap"
            >
              Order Now
            </button>
          </li>
          
          {!user ? (
            <li className="hidden sm:block">
              <button
                onClick={handleLogin}
                className="text-[#7a5a5a] hover:text-[#C0132C] transition-colors"
                title="Admin Login"
              >
                <LogIn size={18} />
              </button>
            </li>
          ) : !isAdmin && (
            <li className="hidden sm:block">
              <button
                onClick={handleLogout}
                className="text-[#7a5a5a] hover:text-[#C0132C] transition-colors flex items-center gap-1 text-[0.7rem] uppercase font-bold"
                title="Logout"
              >
                <LogOut size={16} />
                Switch
              </button>
            </li>
          )}
        </ul>
      </nav>

      {user && !isAdmin && currentPage === 'home' && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] bg-white/90 backdrop-blur-md border border-[#C0132C]/20 px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce">
          <div className="w-2 h-2 bg-[#C0132C] rounded-full animate-pulse" />
          <p className="text-[0.8rem] font-medium text-[#8B0A2A]">
            Logged in as <span className="font-bold">{user.email}</span> (Not an Admin)
          </p>
          <button onClick={handleLogout} className="text-[#C0132C] text-[0.7rem] font-bold uppercase hover:underline ml-2">Logout</button>
        </div>
      )}

      <main>
        {currentPage === 'home' ? (
          <>
            {/* --- Hero Section --- */}
            <section className="relative min-h-screen flex items-center px-6 md:px-12 pt-32 pb-20 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#FAF0F0] via-[#f0d8dc] to-[#F5E8E8]" />
              <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #C0132C 0, #C0132C 1px, transparent 0, transparent 50%)', backgroundSize: '20px 20px' }} />

              <div className="relative z-10 max-w-[1200px] w-full">
                <div className="flex flex-col md:flex-row items-center justify-between gap-12 mb-3">
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="font-serif text-[3.5rem] md:text-[5.5rem] leading-[1.05] font-light text-[#8B0A2A]"
                  >
                    Beauty<br /><em className="italic text-[#C0132C] not-italic">Without</em><br />Breakage.
                  </motion.h1>
                  
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 100, 
                      damping: 15, 
                      delay: 0.5,
                      duration: 0.8 
                    }}
                    className="w-56 h-56 md:w-[400px] md:h-[400px] rounded-[48px] overflow-hidden shadow-[0_32px_64px_rgba(192,19,44,0.15)] border-8 border-white rotate-3 hover:rotate-0 transition-transform duration-500 md:ml-auto"
                  >
                    <img 
                      src="https://lh3.googleusercontent.com/d/1O8On1JS_ApDo4AjQUtRu3sp3ITvkXA3H" 
                      alt="Starlight Beauty" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </motion.div>
                </div>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="font-serif text-[1.35rem] italic text-[#C0132C] mb-6 tracking-wide"
                >
                  Elevate your style, protect your crown.
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-[0.95rem] leading-relaxed text-[#5a3a3a] max-w-[480px] mb-10"
                >
                  Sustainable, affordable hair accessories. We believe your hair deserves better than rubber bands. Every piece is crafted to protect, last, and look stunning.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-wrap gap-4"
                >
                  <button
                    onClick={() => navigateTo('shop')}
                    className="bg-[#C0132C] hover:bg-transparent border-2 border-[#C0132C] text-white hover:text-[#C0132C] px-9 py-3.5 rounded-[12px] text-[0.82rem] font-medium tracking-widest uppercase transition-all"
                  >
                    Shop Collection
                  </button>
                  <button
                    onClick={scrollToAbout}
                    className="border-2 border-[#C0132C] text-[#C0132C] hover:bg-[#C0132C] hover:text-white px-9 py-3.5 rounded-[12px] text-[0.82rem] font-medium tracking-widest uppercase transition-all"
                  >
                    Our Story
                  </button>
                </motion.div>
              </div>
            </section>



            {/* --- Featured Products --- */}
            <section className="py-24 px-6 md:px-12 bg-white overflow-hidden">
              <div className="text-center mb-14">
                <motion.span 
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-[0.72rem] font-medium tracking-[0.14em] uppercase text-[#C0132C] block mb-3"
                >
                  ✦ Featured Products
                </motion.span>
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="font-serif text-[2.2rem] md:text-[3.4rem] font-light text-[#8B0A2A] leading-tight"
                >
                  Our <em className="italic text-[#C0132C] not-italic">Bestsellers</em>
                </motion.h2>
              </div>

              {isLoadingProducts ? (
                <div className="flex flex-col items-center justify-center py-24 gap-6">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-[#C0132C]/10 border-t-[#C0132C] rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-2 h-2 bg-[#C0132C] rounded-full animate-pulse" />
                    </div>
                  </div>
                  <p className="text-[0.75rem] font-bold uppercase tracking-[0.3em] text-[#C0132C] animate-pulse">
                    Curating Excellence...
                  </p>
                </div>
              ) : (
                <>
                  <ProductCarousel 
                    products={products.filter(p => p.badge).length > 0 
                      ? products.filter(p => p.badge) 
                      : products.slice(0, 8)
                    } 
                    onAddToCart={addToCart} 
                  />

                  <div className="text-center mt-14">
                    <button
                      onClick={() => navigateTo('shop')}
                      className="bg-[#C0132C] hover:bg-transparent border-2 border-[#C0132C] text-white hover:text-[#C0132C] px-9 py-3.5 rounded-[12px] text-[0.82rem] font-medium tracking-widest uppercase transition-all flex items-center gap-2 mx-auto"
                    >
                      View Full Collection <ChevronRight size={16} />
                    </button>
                  </div>
                </>
              )}
            </section>

            {/* --- Fashion That Gives Back Section --- */}
            <section className="bg-[#FAF7F7] py-32 px-6 md:px-12 overflow-hidden">
              <div className="max-w-[1200px] mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-32">
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  >
                    <span className="text-[0.72rem] font-bold tracking-[0.3em] uppercase text-[#C0132C] block mb-6">
                      ✦ Our Philosophy
                    </span>
                    <h2 className="font-serif text-[3.5rem] md:text-[5.5rem] font-light text-[#8B0A2A] leading-[1] mb-8">
                      Fashion That<br />
                      <em className="italic text-[#C0132C] not-italic">Gives Back</em>
                    </h2>
                    <p className="text-[1.15rem] leading-relaxed text-[#5a3a3a] opacity-80 max-w-[500px]">
                      At Starlight Accessories, sustainability isn’t a marketing word — it’s the reason we exist. Every choice we make is with our planet and your hair in mind.
                    </p>
                  </motion.div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    {[
                      { 
                        title: 'Reusable by Design', 
                        desc: 'One scrunchie replaces 50+ rubber bands, significantly reducing daily waste.' 
                      },
                      { 
                        title: 'Durable Materials', 
                        desc: 'Satin, crochet yarn, and velvet crafted for long-lasting use and timeless appeal.' 
                      },
                      { 
                        title: 'Reduces Breakage', 
                        desc: 'Gentle tension supports healthier hair growth and minimizes strand damage.' 
                      },
                      { 
                        title: 'Handcrafted Quality', 
                        desc: 'Carefully made with attention to detail and consistency in every single piece.' 
                      }
                    ].map((item, i) => (
                      <motion.div
                        key={item.title}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.15, duration: 0.6 }}
                        className="p-8 bg-white rounded-[32px] shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 border border-[#C0132C]/5"
                      >
                        <h4 className="font-serif text-[1.4rem] font-medium text-[#8B0A2A] mb-4 tracking-tight">
                          {item.title}
                        </h4>
                        <p className="text-[0.9rem] leading-relaxed text-[#7a5a5a] opacity-80">
                          {item.desc}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2 }}
                  className="relative mt-32 py-24 px-8 overflow-hidden"
                >
                  {/* Decorative Elements */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                    <div className="w-[600px] h-[600px] bg-[#C0132C] rounded-full blur-[120px]" />
                  </div>
                  
                  <div className="relative z-10 max-w-[900px] mx-auto text-center">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="inline-block mb-10"
                    >
                      <div className="w-16 h-px bg-[#C0132C]/30 mx-auto mb-4" />
                      <span className="text-[0.7rem] font-bold tracking-[0.4em] uppercase text-[#C0132C]/60">Our Promise</span>
                    </motion.div>

                    <motion.p
                      initial={{ y: 40, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                      className="font-serif text-[2.2rem] md:text-[3.8rem] leading-[1.15] text-[#8B0A2A] italic font-light tracking-tight"
                    >
                      "We believe beauty shouldn't come at the cost of the environment or your hair's health."
                    </motion.p>

                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: "100px" }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, delay: 1 }}
                      className="h-px bg-gradient-to-r from-transparent via-[#C0132C]/40 to-transparent mx-auto mt-12"
                    />
                  </div>
                </motion.div>
              </div>
            </section>



            {/* --- About Section --- */}
            <section id="about-anchor" className="py-24 px-6 md:px-12 bg-[#FAF0F0] flex flex-col md:flex-row items-center gap-20">
              <div className="w-[250px] h-[250px] rounded-full flex-shrink-0 bg-white flex items-center justify-center p-8 border-[3px] border-[#C0132C]/10 shadow-[0_20px_60px_rgba(192,19,44,0.08)] overflow-hidden">
                <img 
                  src="https://lh3.googleusercontent.com/d/18VbOSt3BhA0VVDM6E2vRgRj04RgLAkEz" 
                  alt="Starlight Accessories" 
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex-1 min-w-[280px]">
                <span className="text-[0.72rem] font-medium tracking-[0.14em] uppercase text-[#C0132C] block mb-3">✦ Our Story</span>
                <h2 className="font-serif text-[2.2rem] md:text-[3.4rem] font-light text-[#8B0A2A] leading-tight mb-5">Why <em className="italic text-[#C0132C] not-italic">Starlight</em> Exists</h2>
                <div className="space-y-4 text-[0.95rem] leading-relaxed text-[#5a3a3a]">
                  <p>I noticed something that bothered me quietly for a long time — almost every girl I knew was using rubber bands in her hair. Not because it was a good option, but because it was the only affordable one she could find.</p>
                  <p>Rubber bands snap. They tangle. They pull out strands. And week after week, they get thrown away by the handful. I knew there had to be a better way, so I decided to create it myself.</p>
                  <p>Starlight Accessories started as a simple idea — make something that's actually gentle on your hair, easy on your pocket, and beautiful enough to wear with pride. That idea turned into something real, and I'm so proud to share it with every girl who deserves better for her crown.</p>
                </div>
                <div className="flex flex-wrap gap-8 mt-8">
                  {[
                    { num: '₦600+', label: 'Starting Price' },
                    { num: '50+', label: 'Rubber bands replaced' },
                    { num: '1yr+', label: 'Typical lifespan' }
                  ].map((stat) => (
                    <div key={stat.label} className="text-center">
                      <span className="font-serif text-[2.4rem] text-[#C0132C] font-light block">{stat.num}</span>
                      <span className="text-[0.72rem] text-[#7a5a5a] uppercase tracking-wider">{stat.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* --- Testimonials --- */}
            <section className="py-24 px-6 md:px-12 bg-white">
              <div className="text-center mb-14">
                <span className="text-[0.72rem] font-medium tracking-[0.14em] uppercase text-[#C0132C] block mb-3">✦ Happy Customers</span>
                <h2 className="font-serif text-[2.2rem] md:text-[3.4rem] font-light text-[#8B0A2A] leading-tight">What Our <em className="italic text-[#C0132C] not-italic">Girls Say</em></h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 max-w-[1000px] mx-auto">
                {[
                  { 
                    name: 'Blossom', 
                    quote: "I got a pink scrunchie from starlight accessories and it has lasted for a very very long time. The elastic is still intact and the design of the scrunchies are very unique.", 
                    initial: 'B',
                    color: 'linear-gradient(135deg, #FF69B4, #C0132C)'
                  },
                  { 
                    name: 'Nasara', 
                    quote: "Thank you so much for the earrings! I love that they are simple but have the wow factor! 🤭 Starlight accessories has sponsored my colour matching era. 🤭", 
                    initial: 'N', 
                    color: 'linear-gradient(135deg, #e0186a, #8B0A2A)' 
                  },
                  { 
                    name: 'Oyindamola', 
                    quote: "The headbands are prefect! They fit so well and i like that they come in many colours🥹. The colour gradient claw clips also held my hair really well. Thank you!", 
                    initial: 'O', 
                    color: 'linear-gradient(135deg, #C9A84C, #8B6010)' 
                  },
                  { 
                    name: 'Olajumoke', 
                    quote: "The scrunchies are really nice, soft and perfect for my hairs. I also like that they come in different colours.", 
                    initial: 'O', 
                    color: 'linear-gradient(135deg, #FF9A8B, #FF6A88)' 
                  }
                ].map((review) => (
                  <motion.div
                    key={review.name}
                    whileHover={{ y: -4 }}
                    className="bg-[#FAF0F0] p-8 rounded-[28px] border border-[#C0132C]/10 shadow-sm"
                  >
                    <div className="text-[#C9A84C] text-[0.85rem] tracking-widest mb-2">★★★★★</div>
                    <p className="font-serif text-[1.05rem] italic leading-relaxed text-[#1A1A1A] mb-5">
                      <span className="text-2xl text-[#C0132C] leading-none mr-1">"</span>
                      {review.quote}
                    </p>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center font-serif text-white font-semibold"
                        style={{ background: review.color || 'linear-gradient(135deg, #C0132C, #E0186A)' }}
                      >
                        {review.initial}
                      </div>
                      <span className="font-medium text-[0.88rem]">{review.name}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          </>
        ) : currentPage === 'shop' ? (
          /* --- Shop Page --- */
          <div className="pt-24">
            <section className="bg-gradient-to-br from-[#8B0A2A] to-[#6a0a20] text-white text-center py-24 px-6 md:px-12 relative overflow-hidden">
              <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)', backgroundSize: '18px 18px' }} />
              <div className="relative z-10">
                <span className="text-[0.72rem] font-medium tracking-[0.14em] uppercase text-white/60 block mb-3">✦ Collections</span>
                <h2 className="font-serif text-[2.2rem] md:text-[3.4rem] font-light text-white leading-tight">Shop <em className="italic text-[#ffb3c1] not-italic">Starlight</em></h2>
                <p className="text-white/70 mt-4">Protective accessories for every style, every day.</p>
              </div>
            </section>

            <div className="sticky top-[76px] z-40 bg-white border-b border-[#C0132C]/10 px-6 py-4 overflow-x-auto">
              <div className="flex gap-3 justify-start md:justify-center min-w-max">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-6 py-2 rounded-full border-[1.5px] text-[0.78rem] font-medium tracking-wider uppercase transition-all ${selectedCategory === cat.id ? 'bg-[#C0132C] border-[#C0132C] text-white' : 'border-[#C0132C]/25 text-[#1A1A1A] hover:bg-[#C0132C] hover:text-white hover:border-[#C0132C]'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <section className="py-12 px-6 md:px-12 bg-white min-h-[60vh]">
              <div className="max-w-[1200px] mx-auto">
                <AnimatePresence mode="popLayout">
                  {isLoadingProducts ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-6">
                      <div className="w-12 h-12 border-4 border-[#C0132C]/10 border-t-[#C0132C] rounded-full animate-spin" />
                      <p className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[#C0132C]">Loading Collections...</p>
                    </div>
                  ) : products.filter(p => selectedCategory === 'all' || p.category === selectedCategory).length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {products.filter(p => selectedCategory === 'all' || p.category === selectedCategory).map((product) => (
                        <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-24 bg-[#FAF0F0]/50 rounded-[40px] border-2 border-dashed border-[#C0132C]/10">
                      <ShoppingBag size={48} className="mx-auto mb-4 text-[#C0132C]/20" />
                      <h3 className="font-serif text-xl text-[#8B0A2A] mb-2">No products in this category yet</h3>
                      <p className="text-[#7a5a5a]">Check back soon for new arrivals!</p>
                    </div>
                  )}
                </AnimatePresence>

                <div className="text-center py-16 mt-12 border-t border-[#C0132C]/10">
                  <p className="text-[0.9rem] text-[#7a5a5a] mb-6">Browse and order directly via WhatsApp — fast delivery across Lagos.</p>
                  <a
                    href="https://wa.me/2348149783549"
                    target="_blank"
                    className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1aad53] text-white rounded-[12px] py-3.5 px-9 text-[0.82rem] font-medium tracking-widest uppercase transition-all"
                  >
                    <ShoppingBag size={18} />
                    Chat with us on WhatsApp
                  </a>
                </div>
              </div>
            </section>
          </div>
        ) : (
          <AdminDashboard 
            products={products}
            onAddProduct={addProduct}
            onUpdateProduct={updateProduct}
            onDeleteProduct={deleteProduct}
            onLogout={handleLogout}
          />
        )}
      </main>

      {/* --- Footer --- */}
      <footer className="bg-[#1A1A1A] text-white/70 py-16 px-6 md:px-12 text-center">
        <div className="flex flex-col items-center mb-12">
          <img 
            src="https://lh3.googleusercontent.com/d/1KNYmJC2cx9baX4jGOe5zhq4qKd4AhY4f" 
            alt="Starlight Accessories" 
            className="h-28 md:h-36 max-w-[85vw] w-auto object-contain mb-4"
            referrerPolicy="no-referrer"
          />
        </div>
        <ul className="flex justify-center gap-8 list-none flex-wrap mb-10">
          <li><button onClick={() => navigateTo('home')} className="text-white/55 hover:text-white transition-colors text-[0.78rem] tracking-wider uppercase">Home</button></li>
          <li><button onClick={() => navigateTo('shop')} className="text-white/55 hover:text-white transition-colors text-[0.78rem] tracking-wider uppercase">Shop</button></li>
          <li><button onClick={scrollToAbout} className="text-white/55 hover:text-white transition-colors text-[0.78rem] tracking-wider uppercase">About</button></li>
        </ul>
        <a
          href="https://instagram.com/star_lightaccessories24/"
          target="_blank"
          className="inline-flex items-center gap-2.5 bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] text-white px-6 py-2.5 rounded-full text-[0.78rem] font-medium tracking-wide hover:scale-105 transition-transform"
        >
          <Instagram size={18} />
          Follow on Instagram
        </a>
        <div className="text-[0.72rem] text-white/30 mt-10">© 2026 Starlight Accessories · Lagos, Nigeria · All rights reserved</div>
      </footer>

      <CartDrawer 
        cart={cart} 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onCheckout={handleCheckout}
        onStartShopping={() => {
          navigateTo('shop');
          setIsCartOpen(false);
        }}
      />
    </div>
  );
}
