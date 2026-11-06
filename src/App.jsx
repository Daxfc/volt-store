import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMoon, 
  faSun, 
  faStore, 
  faMagnifyingGlass, 
  faShoppingCart, 
  faHeadset,
  faXmark,
  faCartPlus,
  faBolt,
  faChevronLeft,
  faChevronRight,
  faChevronDown,
  faExpand,
  faTicket,
  faCheckCircle,
  faExclamationCircle,
  faRobot,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import './App.css';
import voltBlack from './assets/blackVolt.png';
import voltWhite from './assets/whiteVolt.png';
import utFlag from './assets/utFlag.png';
import italyFlag from './assets/italyFlag.png';
import Empty from './assets/empty.png';

import Shop from './components/Shop';
import Search from './components/Search';
import Cart from './components/Cart';
import Support from './components/Support';
import ActionMenu from './components/ActionMenu';
import AIAssistant from './components/AIAssistant';
import NotFound from './components/NotFound';

function BottomNav({ activeTab, searchActive, onTabChange, triggerFocus, totalCartCount, lang }) {
  const isShopActive = (activeTab === 'shop' && !searchActive) || (!searchActive && activeTab !== 'cart' && activeTab !== 'support');
  const isSearchActive = searchActive || activeTab === 'search';
  const isCartActive = activeTab === 'cart';
  const isSupportActive = activeTab === 'support';

  return (
    <nav className="bottom-nav">
      <Link 
        to="/" 
        className={`bottom-nav-item ${isShopActive ? 'active' : ''}`} 
        title={lang === 'it' ? 'Negozio' : 'Shop'} 
        onClick={() => onTabChange('shop')}
      >
        <FontAwesomeIcon icon={faStore} />
      </Link>
      <Link 
        to="/" 
        className={`bottom-nav-item ${isSearchActive ? 'active' : ''}`} 
        title={lang === 'it' ? 'Cerca' : 'Search'} 
        onClick={() => { onTabChange('search', true); triggerFocus(); }}
      >
        <FontAwesomeIcon icon={faMagnifyingGlass} />
      </Link>
      <Link 
        to="/cart" 
        className={`bottom-nav-item cart-tab ${isCartActive ? 'active' : ''}`} 
        title={lang === 'it' ? 'Carrello' : 'Cart'} 
        onClick={() => onTabChange('cart')}
      >
        <FontAwesomeIcon icon={faShoppingCart} />
        {totalCartCount > 0 && <span className="badge">{totalCartCount}</span>}
      </Link>
      <Link 
        to="/support" 
        className={`bottom-nav-item ${isSupportActive ? 'active' : ''}`} 
        title={lang === 'it' ? 'Supporto' : 'Support'} 
        onClick={() => onTabChange('support')}
      >
        <FontAwesomeIcon icon={faHeadset} />
      </Link>
    </nav>
  );
}

function DesktopSidebar({ activeTab, searchActive, onTabChange, triggerFocus, totalCartCount, lang, onOpenRedeemModal }) {
  const isShopActive = (activeTab === 'shop' && !searchActive) || (!searchActive && activeTab !== 'cart' && activeTab !== 'support');
  const isSearchActive = searchActive || activeTab === 'search';
  const isCartActive = activeTab === 'cart';
  const isSupportActive = activeTab === 'support';

  return (
    <aside className="desktop-sidebar">
      <nav className="desktop-sidebar-nav">
        <Link 
          to="/" 
          className={`sidebar-link ${isShopActive ? 'active' : ''}`} 
          onClick={() => onTabChange('shop')}
        >
          <FontAwesomeIcon icon={faStore} className="sidebar-icon" />
          <span>{lang === 'it' ? 'Negozio' : 'Shop'}</span>
        </Link>
        <Link 
          to="/" 
          className={`sidebar-link ${isSearchActive ? 'active' : ''}`} 
          onClick={() => { onTabChange('search', true); triggerFocus(); }}
        >
          <FontAwesomeIcon icon={faMagnifyingGlass} className="sidebar-icon" />
          <span>{lang === 'it' ? 'Cerca' : 'Search'}</span>
        </Link>
        <Link 
          to="/cart" 
          className={`sidebar-link cart-tab ${isCartActive ? 'active' : ''}`} 
          onClick={() => onTabChange('cart')}
        >
          <FontAwesomeIcon icon={faShoppingCart} className="sidebar-icon" />
          <span>{lang === 'it' ? 'Carrello' : 'Cart'}</span>
          {totalCartCount > 0 && <span className="sidebar-badge">{totalCartCount}</span>}
        </Link>
        <Link 
          to="/support" 
          className={`sidebar-link ${isSupportActive ? 'active' : ''}`} 
          onClick={() => onTabChange('support')}
        >
          <FontAwesomeIcon icon={faHeadset} className="sidebar-icon" />
          <span>{lang === 'it' ? 'Supporto' : 'Support'}</span>
        </Link>

        <div className="sidebar-divider" />

        <button 
          className="sidebar-link sidebar-action-btn" 
          onClick={onOpenRedeemModal}
        >
          <FontAwesomeIcon icon={faTicket} className="sidebar-icon" />
          <span>{lang === 'it' ? 'Riscatta Codice' : 'Redeem Code'}</span>
        </button>
      </nav>
    </aside>
  );
}

function AppContent() {
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('volt_dark_mode');
    return savedTheme ? JSON.parse(savedTheme) : false;
  });
  
  const [isDiscountApplied, setIsDiscountApplied] = useState(() => {
    const savedDiscount = localStorage.getItem('volt_discount_applied');
    return savedDiscount ? JSON.parse(savedDiscount) : false;
  });

  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('volt_cart_items');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [lang, setLang] = useState(() => {
    const savedLang = localStorage.getItem('volt_lang');
    if (savedLang) return savedLang;
    const browserLang = navigator.language || navigator.userLanguage;
    return browserLang && browserLang.startsWith('it') ? 'it' : 'en';
  });

  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const langDropdownRef = useRef(null);

  const [searchActive, setSearchActive] = useState(false);
  const [activeTab, setActiveTab] = useState('shop');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isClosing, setIsClosing] = useState(false);
  const [autoFocusTrigger, setAutoFocusTrigger] = useState(0);
  const [fullscreenImageIndex, setFullscreenImageIndex] = useState(null);
  const [fullscreenSlideIndex, setFullscreenSlideIndex] = useState(0);
  
  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
  const [redeemCodeInput, setRedeemCodeInput] = useState('');
  const [redeemMessage, setRedeemMessage] = useState(null);
  const [isAiOpen, setIsAiOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [progressWidth, setProgressWidth] = useState(0);
  
  const carouselTrackRef = useRef(null);
  const fullscreenTrackRef = useRef(null);
  const isScrollingRef = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();

  const triggerLoading = (callback, skipLoading = false) => {
    if (skipLoading) {
      if (callback) callback();
      return;
    }

    setIsLoading(true);
    setProgressWidth(20);
    setTimeout(() => setProgressWidth(60), 100);
    setTimeout(() => setProgressWidth(100), 250);

    setTimeout(() => {
      if (callback) callback();
      setTimeout(() => {
        setIsLoading(false);
        setProgressWidth(0);
      }, 300);
    }, 450);
  };

  useEffect(() => {
    localStorage.setItem('volt_dark_mode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('volt_discount_applied', JSON.stringify(isDiscountApplied));
  }, [isDiscountApplied]);

  useEffect(() => {
    localStorage.setItem('volt_cart_items', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('volt_lang', lang);
  }, [lang]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
        setIsLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (location.pathname === '/cart') {
      setActiveTab('cart');
      setSearchActive(false);
    } else if (location.pathname === '/support') {
      setActiveTab('support');
      setSearchActive(false);
    } else if (location.pathname === '/search') {
      setActiveTab('search');
      setSearchActive(true);
    } else if (location.pathname === '/') {
      if (!searchActive) {
        setActiveTab('shop');
      }
    } else {
      setActiveTab('none');
      setSearchActive(false);
    }
  }, [location.pathname, searchActive]);

  const handleTabChange = (tab, isSearchClick = false) => {
    const isCurrentlyOnShop = location.pathname === '/' && activeTab === 'shop' && !searchActive;
    const shouldSkipLoading = isSearchClick && isCurrentlyOnShop && tab === 'search';

    triggerLoading(() => {
      if (tab === 'shop') {
        setSearchActive(false);
        setActiveTab('shop');
        setAutoFocusTrigger(0);
      } else if (tab === 'search') {
        setSearchActive(true);
        setActiveTab('search');
      } else {
        setSearchActive(false);
        setActiveTab(tab);
        setAutoFocusTrigger(0);
      }
    }, shouldSkipLoading);
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top;

    const flyer = document.createElement('div');
    flyer.className = 'cart-flyer-number';
    flyer.innerText = '+1';

    const cartTabElement = document.querySelector('.cart-tab');
    if (cartTabElement) {
      const cartRect = cartTabElement.getBoundingClientRect();
      const targetX = cartRect.left + cartRect.width / 2 - x;
      const targetY = cartRect.top + cartRect.height / 2 - y;
      flyer.style.setProperty('--target-x', `${targetX}px`);
      flyer.style.setProperty('--target-y', `${targetY}px`);
    }

    flyer.style.left = `${x}px`;
    flyer.style.top = `${y}px`;
    document.body.appendChild(flyer);

    setTimeout(() => {
      flyer.remove();
    }, 1200);

    const baseP = product.price || 99.99;

    const formattedProduct = {
      ...product,
      price: baseP,
      originalPrice: baseP,
      image: product.image || (product.images && product.images[0]) || Empty
    };

    setCartItems(prev => {
      const existing = prev.find(item => item.id === formattedProduct.id);
      if (existing) {
        return prev.map(item => item.id === formattedProduct.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...formattedProduct, quantity: 1 }];
    });
  };

  const handleBuyNow = (e, product) => {
    e.stopPropagation();
    triggerLoading(() => {
      const baseP = product.price || 99.99;

      const formattedProduct = {
        ...product,
        price: baseP,
        originalPrice: baseP,
        image: product.image || (product.images && product.images[0]) || Empty
      };

      setCartItems(prev => {
        const existing = prev.find(item => item.id === formattedProduct.id);
        if (existing) {
          return prev.map(item => item.id === formattedProduct.id ? { ...item, quantity: item.quantity + 1 } : item);
        }
        return [...prev, { ...formattedProduct, quantity: 1 }];
      });
      setSelectedProduct(null);
      setActiveTab('cart');
      navigate('/cart');
    });
  };

  const handleOpenProductModal = (product) => {
    setIsClosing(false);
    setActiveSlideIndex(0);
    const baseP = product.originalPrice || product.price || 99.99;
    
    const localizedTitle = lang === 'it' ? (product.titleIt || product.title) : (product.titleEn || product.title);
    const localizedDesc = lang === 'it' ? (product.descriptionIt || product.description) : (product.descriptionEn || product.description);

    let carouselUrls = [product.image || Empty];
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      carouselUrls = product.images;
    }

    setSelectedProduct({
      id: product.id,
      category: product.category || 'General',
      title: localizedTitle,
      price: baseP,
      originalPrice: baseP,
      image: product.image || Empty,
      images: carouselUrls,
      description: localizedDesc || 'This is a premium high-performance item.'
    });
  };

  const handleCloseModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setSelectedProduct(null);
      setIsClosing(false);
    }, 250);
  };

  const handleScrollCarousel = (direction) => {
    if (carouselTrackRef.current && selectedProduct) {
      const slideWidth = carouselTrackRef.current.clientWidth;
      const totalSlides = selectedProduct.images.length;
      let newIndex;

      if (direction === 'left') {
        newIndex = activeSlideIndex === 0 ? totalSlides - 1 : activeSlideIndex - 1;
      } else {
        newIndex = activeSlideIndex === totalSlides - 1 ? 0 : activeSlideIndex + 1;
      }

      isScrollingRef.current = true;
      setActiveSlideIndex(newIndex);
      carouselTrackRef.current.scrollTo({
        left: newIndex * slideWidth,
        behavior: 'smooth'
      });

      setTimeout(() => {
        isScrollingRef.current = false;
      }, 350);
    }
  };

  const handleScrollFullscreen = (direction) => {
    if (fullscreenTrackRef.current && selectedProduct) {
      const slideWidth = fullscreenTrackRef.current.clientWidth;
      const totalSlides = selectedProduct.images.length;
      let newIndex;

      if (direction === 'left') {
        newIndex = fullscreenSlideIndex === 0 ? totalSlides - 1 : fullscreenSlideIndex - 1;
      } else {
        newIndex = fullscreenSlideIndex === totalSlides - 1 ? 0 : fullscreenSlideIndex + 1;
      }

      setFullscreenSlideIndex(newIndex);
      fullscreenTrackRef.current.scrollTo({
        left: newIndex * slideWidth,
        behavior: 'smooth'
      });
    }
  };

  const handleScrollIndicator = (idx) => {
    isScrollingRef.current = true;
    setActiveSlideIndex(idx);
    if (carouselTrackRef.current) {
      const slideWidth = carouselTrackRef.current.clientWidth;
      carouselTrackRef.current.scrollTo({
        left: idx * slideWidth,
        behavior: 'smooth'
      });
    }
    setTimeout(() => {
      isScrollingRef.current = false;
    }, 350);
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className={`app-container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      
      <div className="top-progress-bar-container">
        <div 
          className="top-progress-bar-fill" 
          style={{ width: `${progressWidth}%`, opacity: progressWidth > 0 ? 1 : 0 }}
        />
      </div>

      <header className="top-bar">
        <Link to="/" className="logo-link" onClick={(e) => { e.preventDefault(); handleTabChange('shop'); navigate('/'); }}>
          <img 
            src={darkMode ? voltWhite : voltBlack} 
            alt="Volt Store" 
            className="brand-logo fade-logo" 
          />
        </Link>

        <div className="top-actions">
          <div className="lang-dropdown-wrapper" ref={langDropdownRef}>
            <button 
              className="lang-toggle-btn" 
              onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
            >
              <img src={lang === 'it' ? italyFlag : utFlag} alt={lang} className="lang-flag-icon" />
              <span className="lang-code-text">{lang.toUpperCase()}</span>
              <FontAwesomeIcon icon={faChevronDown} className={`lang-chevron ${isLangDropdownOpen ? 'open' : ''}`} />
            </button>

            {isLangDropdownOpen && (
              <div className="lang-dropdown-menu">
                <div 
                  className={`lang-option ${lang === 'en' ? 'active' : ''}`}
                  onClick={() => { setLang('en'); setIsLangDropdownOpen(false); }}
                >
                  <img src={utFlag} alt="English" className="lang-flag-icon" />
                  <span>English</span>
                </div>
                <div 
                  className={`lang-option ${lang === 'it' ? 'active' : ''}`}
                  onClick={() => { setLang('it'); setIsLangDropdownOpen(false); }}
                >
                  <img src={italyFlag} alt="Italiano" className="lang-flag-icon" />
                  <span>Italiano</span>
                </div>
              </div>
            )}
          </div>

          <button className="icon-btn theme-toggle-btn" onClick={toggleTheme} title="Toggle Theme">
            <FontAwesomeIcon icon={darkMode ? faSun : faMoon} />
          </button>
        </div>
      </header>

      <div className="app-body-wrapper">
        <DesktopSidebar 
          activeTab={activeTab}
          searchActive={searchActive}
          onTabChange={handleTabChange}
          triggerFocus={() => setAutoFocusTrigger(prev => prev + 1)}
          totalCartCount={totalCartCount}
          lang={lang}
          onOpenRedeemModal={() => {
            setRedeemMessage(null);
            setIsRedeemModalOpen(true);
          }}
        />

        <main className="main-content" style={{ position: 'relative' }}>
          {isLoading && (
            <div className="center-loading-overlay">
              <div className="center-loading-card">
                <FontAwesomeIcon icon={faSpinner} className="center-spinner-icon" spin />
                <p className="center-loading-text">{lang === 'it' ? 'Attendere prego...' : 'Please wait...'}</p>
              </div>
            </div>
          )}

          <Routes>
            <Route path="/" element={<Shop setSearchActive={setSearchActive} onAddToCart={handleAddToCart} setCartItems={setCartItems} onOpenProduct={handleOpenProductModal} onTriggerLoading={triggerLoading} autoFocusTrigger={autoFocusTrigger} isDiscountApplied={isDiscountApplied} lang={lang} />} />
            <Route path="/search" element={<Search onAddToCart={handleAddToCart} setCartItems={setCartItems} onOpenProduct={handleOpenProductModal} isDiscountApplied={isDiscountApplied} lang={lang} />} />
            <Route path="/product/:id" element={<Shop setSearchActive={setSearchActive} onAddToCart={handleAddToCart} setCartItems={setCartItems} onOpenProduct={handleOpenProductModal} autoFocusTrigger={autoFocusTrigger} isDiscountApplied={isDiscountApplied} lang={lang} />} />
            <Route path="/cart" element={<Cart cartItems={cartItems} setCartItems={setCartItems} lang={lang} isDiscountApplied={isDiscountApplied} setIsDiscountApplied={setIsDiscountApplied} onTriggerLoading={triggerLoading} />} />
            <Route path="/support" element={<Support lang={lang} />} />
            <Route path="*" element={<NotFound lang={lang} />} />
          </Routes>
        </main>
      </div>

      {selectedProduct && (
        <div className={`modal-overlay ${isClosing ? 'closing' : ''}`} onClick={handleCloseModal}>
          <div className={`modal-sheet ${isClosing ? 'closing' : ''}`} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={handleCloseModal}>
              <FontAwesomeIcon icon={faXmark} />
            </button>

            <div className="modal-carousel-container" style={{ position: 'relative', width: '100%', height: '280px', background: darkMode ? '#0f172a' : '#f8fafc', borderRadius: '14px', border: '1px solid ' + (darkMode ? '#334155' : '#e2e8f0'), overflow: 'hidden', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
              
              {selectedProduct.images.length > 1 && (
                <button 
                  className="carousel-arrow left desktop-only-arrow" 
                  onClick={() => handleScrollCarousel('left')} 
                  style={{ 
                    position: 'absolute', 
                    left: '12px', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    zIndex: 20, 
                    width: '36px', 
                    height: '36px', 
                    borderRadius: '50%', 
                    background: darkMode ? '#1e293b' : '#ffffff', 
                    border: '1px solid ' + (darkMode ? '#334155' : '#e2e8f0'),
                    color: darkMode ? '#f8fafc' : '#1a1a1a',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>
              )}

              <div 
                className="modal-carousel-track" 
                ref={carouselTrackRef} 
                onWheel={(e) => {
                  if (window.innerWidth >= 768) {
                    if (e.deltaY !== 0) {
                      e.preventDefault();
                      carouselTrackRef.current.scrollLeft += e.deltaY;
                    }
                  }
                }}
                onScroll={(e) => {
                  if (isScrollingRef.current) return;
                  const index = Math.round(e.target.scrollLeft / e.target.clientWidth);
                  if (index !== activeSlideIndex) setActiveSlideIndex(index);
                }} 
                style={{ display: 'flex', width: '100%', height: '100%', overflowX: 'auto', scrollSnapType: 'x mandatory', scrollBehavior: 'smooth', scrollbarWidth: 'none', boxSizing: 'border-box' }}
              >
                {selectedProduct.images.map((imgSrc, imgIdx) => (
                  <div className="modal-slide" key={imgIdx} style={{ minWidth: '100%', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', scrollSnapAlign: 'start', flexShrink: '0', cursor: 'pointer', position: 'relative', padding: '12px', boxSizing: 'border-box', overflow: 'hidden' }} onClick={() => { setFullscreenSlideIndex(imgIdx); setFullscreenImageIndex(imgIdx); }}>
                    <img src={imgSrc} alt="Product Slide" className="modal-slide-img" style={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto', objectFit: 'contain', borderRadius: '10px', display: 'block' }} />
                    <div style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '3px 6px', borderRadius: '6px', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <FontAwesomeIcon icon={faExpand} />
                    </div>
                  </div>
                ))}
              </div>

              {selectedProduct.images.length > 1 && (
                <button 
                  className="carousel-arrow right desktop-only-arrow" 
                  onClick={() => handleScrollCarousel('right')} 
                  style={{ 
                    position: 'absolute', 
                    right: '12px', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    zIndex: 20, 
                    width: '36px', 
                    height: '36px', 
                    borderRadius: '50%', 
                    background: darkMode ? '#1e293b' : '#ffffff', 
                    border: '1px solid ' + (darkMode ? '#334155' : '#e2e8f0'),
                    color: darkMode ? '#f8fafc' : '#1a1a1a',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}
                >
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
              )}

              {selectedProduct.images.length > 1 && (
                <div className="modal-dots-container" style={{ position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '5px', zIndex: '5' }}>
                  {selectedProduct.images.map((_, dotIdx) => (
                    <div 
                      key={dotIdx} 
                      className={`modal-dot ${dotIdx === activeSlideIndex ? 'active' : ''}`}
                      onClick={() => handleScrollIndicator(dotIdx)}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="modal-details">
              <span className="modal-category-tag">{selectedProduct.category}</span>
              <h2>{selectedProduct.title}</h2>
              <div className="price-container" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <p className="modal-price" style={{ margin: 0 }}>${selectedProduct.price.toFixed(2)}</p>
              </div>
              <p className="modal-desc">{selectedProduct.description}</p>

              <div className="modal-action-buttons">
                <button className="modal-btn-cart" onClick={(e) => handleAddToCart(e, selectedProduct)}>
                  <FontAwesomeIcon icon={faCartPlus} /> {lang === 'it' ? 'Aggiungi' : 'Add to Cart'}
                </button>
                <button className="modal-btn-buy" onClick={(e) => handleBuyNow(e, selectedProduct)}>
                  <FontAwesomeIcon icon={faBolt} /> {lang === 'it' ? 'Acquista' : 'Buy Now'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isRedeemModalOpen && (
        <div className="modal-overlay centered-modal-overlay" onClick={() => setIsRedeemModalOpen(false)}>
          <div className="modal-sheet centered-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setIsRedeemModalOpen(false)}>
              <FontAwesomeIcon icon={faXmark} />
            </button>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(0,102,255,0.1)', color: '#0066ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px auto', fontSize: '20px' }}>
                <FontAwesomeIcon icon={faTicket} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: darkMode ? '#f8fafc' : '#0f172a' }}>
                {lang === 'it' ? 'Riscatta Codice Sconto' : 'Redeem Promo Code'}
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                {lang === 'it' ? 'Inserisci il tuo codice promozionale per applicare lo sconto.' : 'Enter your promotional code to apply the discount.'}
              </p>
            </div>

            {redeemMessage && (
              <div style={{ padding: '10px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', background: redeemMessage.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: redeemMessage.success ? '#10b981' : '#ef4444' }}>
                <FontAwesomeIcon icon={redeemMessage.success ? faCheckCircle : faExclamationCircle} />
                <span>{redeemMessage.text}</span>
              </div>
            )}

            <input 
              type="text" 
              placeholder={lang === 'it' ? 'Inserisci codice...' : 'Enter code...'} 
              value={redeemCodeInput}
              onChange={(e) => setRedeemCodeInput(e.target.value)}
              style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', marginBottom: '16px', background: darkMode ? '#0f172a' : '#f8fafc', color: darkMode ? '#f8fafc' : '#1a1a1a' }}
            />
            <button 
              onClick={() => {
                const enteredCode = redeemCodeInput.trim().toUpperCase();
                
                const isAlreadyRedeemed = localStorage.getItem('volt_promo_redeemed');
                if (isAlreadyRedeemed === 'true') {
                  setRedeemMessage({
                    success: false,
                    text: lang === 'it' ? 'Codice già utilizzato o scaduto!' : 'Code already redeemed or expired!'
                  });
                  return;
                }

                if (enteredCode === 'VOLT') {
                  setIsDiscountApplied(true);
                  localStorage.setItem('volt_promo_redeemed', 'true');
                  setRedeemMessage({
                    success: true,
                    text: lang === 'it' ? 'Codice applicato con successo! Sconto del 20% attivo.' : 'Code applied successfully! 20% discount active.'
                  });
                  setTimeout(() => {
                    setIsRedeemModalOpen(false);
                    setRedeemCodeInput('');
                    setRedeemMessage(null);
                  }, 1800);
                } else {
                  setRedeemMessage({
                    success: false,
                    text: lang === 'it' ? 'Codice non valido o scaduto!' : 'Invalid or expired code!'
                  });
                }
              }}
              style={{ width: '100%', background: 'linear-gradient(135deg, #0066ff, #00c6ff)', color: '#fff', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0, 102, 255, 0.25)' }}
            >
              {lang === 'it' ? 'Applica Codice' : 'Apply Code'}
            </button>
          </div>
        </div>
      )}

      {fullscreenImageIndex !== null && selectedProduct && (
        <div className="mobile-fullscreen-image-fix" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.92)', zIndex: 10005, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setFullscreenImageIndex(null)}>
          <button style={{ position: 'absolute', top: '16px', right: '16px', background: '#334155', border: 'none', color: '#fff', width: '36px', height: '36px', borderRadius: '50%', fontSize: '16px', cursor: 'pointer', zIndex: 10006, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setFullscreenImageIndex(null)}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
          
          <div style={{ width: '100%', maxWidth: '600px', height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            {selectedProduct.images.length > 1 && (
              <button 
                className="desktop-only-fullscreen-arrow" 
                onClick={() => handleScrollFullscreen('left')}
                style={{
                  position: 'absolute',
                  left: '-50px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  color: '#fff',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  zIndex: 10007,
                  display: 'none',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px'
                }}
              >
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>
            )}

            <div style={{ display: 'flex', width: '100%', height: '100%', overflowX: 'auto', scrollSnapType: 'x mandatory', scrollBehavior: 'smooth', scrollbarWidth: 'none', boxSizing: 'border-box' }} ref={fullscreenTrackRef} onScroll={(e) => {
              const index = Math.round(e.target.scrollLeft / e.target.clientWidth);
              if (index !== fullscreenSlideIndex) setFullscreenSlideIndex(index);
            }}>
              {selectedProduct.images.map((imgSrc, imgIdx) => (
                <div key={imgIdx} style={{ minWidth: '100%', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', scrollSnapAlign: 'start', flexShrink: 0, padding: '10px', boxSizing: 'border-box', overflow: 'hidden' }}>
                  <img src={imgSrc} alt="Fullscreen Slide" style={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto', objectFit: 'contain', borderRadius: '12px', display: 'block' }} />
                </div>
              ))}
            </div>

            {selectedProduct.images.length > 1 && (
              <button 
                className="desktop-only-fullscreen-arrow" 
                onClick={() => handleScrollFullscreen('right')}
                style={{
                  position: 'absolute',
                  right: '-50px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  color: '#fff',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  zIndex: 10007,
                  display: 'none',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px'
                }}
              >
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            )}
          </div>
        </div>
      )}

      <div className="mobile-only-action-menu">
        <ActionMenu setIsDiscountApplied={setIsDiscountApplied} darkMode={darkMode} lang={lang} />
      </div>

      <div className={`roblox-ai-widget ${darkMode ? 'dark' : 'light'}`}>
        {!isAiOpen ? (
          <button className="roblox-ai-trigger-bar" onClick={() => setIsAiOpen(true)}>
            <span onClick={() => setIsAiOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', height: '100%', justifyContent: 'center' }}>
              <FontAwesomeIcon icon={faRobot} style={{ fontSize: '15px' }} />
              {lang === 'it' ? 'Chat Assistente AI' : 'AI Chat'}
            </span>
          </button>
        ) : null}
      </div>

      <AIAssistant 
        isOpen={isAiOpen} 
        onClose={() => setIsAiOpen(false)} 
        darkMode={darkMode} 
        lang={lang} 
      />

      <BottomNav 
        activeTab={activeTab} 
        searchActive={searchActive}
        onTabChange={handleTabChange} 
        triggerFocus={() => setAutoFocusTrigger(prev => prev + 1)} 
        totalCartCount={totalCartCount}
        lang={lang}
      />

    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}