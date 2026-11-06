import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMagnifyingGlass, 
  faCartPlus, 
  faBolt, 
  faXmark, 
  faChevronRight, 
  faChevronLeft 
} from '@fortawesome/free-solid-svg-icons';
import { client, urlFor } from '../sanity';
import Empty from '../assets/empty.png';
import './Shop.css';

export default function Shop({ setSearchActive, onAddToCart, setCartItems, onOpenProduct, autoFocusTrigger, isDiscountApplied, lang, onTriggerLoading }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [products, setProducts] = useState([]);
  const inputRef = useRef(null);
  const scrollRefs = useRef({});
  const navigate = useNavigate();

  const lastTriggerRef = useRef(0);

  useEffect(() => {
    client.fetch(`*[_type == "product"]`)
      .then((data) => {
        if (data && data.length > 0) {
          const formatted = data.map(item => {
            const baseP = item.price || 99.99;
            
            const mainImgUrl = item.image ? urlFor(item.image).url() : Empty;
            
            const rawGallery = item.gallery || item.images;
            let carouselUrls = [];
            
            if (rawGallery && Array.isArray(rawGallery) && rawGallery.length > 0) {
              carouselUrls = rawGallery.slice(0, 4).map(img => urlFor(img).url());
            } else {
              carouselUrls = [mainImgUrl];
            }

            const titleEn = item.name || 'Unnamed Product';
            const titleIt = item.nameIt || titleEn;
            const descEn = item.description || 'Premium high-performance item.';
            const descIt = item.descriptionIt || descEn;

            return {
              id: item._id,
              category: item.category || 'General',
              title: lang === 'it' ? titleIt : titleEn,
              titleEn: titleEn,
              titleIt: titleIt,
              price: baseP,
              originalPrice: baseP,
              image: mainImgUrl,
              images: carouselUrls,
              description: lang === 'it' ? descIt : descEn,
              descriptionEn: descEn,
              descriptionIt: descIt
            };
          });
          setProducts(formatted);
        }
      })
      .catch((err) => console.error("Sanity fetch error:", err));
  }, [lang]);

  useEffect(() => {
    if (autoFocusTrigger > 0 && autoFocusTrigger !== lastTriggerRef.current) {
      lastTriggerRef.current = autoFocusTrigger;
      setIsFocused(true);
      setSearchActive(true);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } else if (autoFocusTrigger === 0) {
      setIsFocused(false);
      setSearchActive(false);
      if (inputRef.current) {
        inputRef.current.blur();
      }
    }
  }, [autoFocusTrigger, setSearchActive]);

  useEffect(() => {
    const handlePopState = () => {
      setIsFocused(false);
      setSearchActive(false);
      if (inputRef.current) {
        inputRef.current.blur();
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isFocused, setSearchActive]);

  const categoryNames = ['Shirts', 'Pants', 'Shoes', 'Machines', 'Tools'];
  const categories = categoryNames.map(catName => ({
    name: catName,
    items: products.filter(p => p.category.toLowerCase() === catName.toLowerCase())
  })).filter(cat => cat.items.length > 0);

  const filteredProducts = searchQuery.trim() === '' 
    ? [] 
    : products.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const displayedResults = filteredProducts.slice(0, 3);
  const hasMoreResults = filteredProducts.length > 3;

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (searchQuery.trim()) {
        setSearchActive(false);
        setIsFocused(false);
        navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      }
    }
  };

  const handleBuyNowDirect = (e, product) => {
    e.stopPropagation();
    
    const executeBuy = () => {
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
      setSearchActive(false);
      setIsFocused(false);
      navigate('/cart');
    };

    if (onTriggerLoading) {
      onTriggerLoading(executeBuy);
    } else {
      executeBuy();
    }
  };

  const handleExploreClick = () => {
    const categoriesElement = document.getElementById('categories-section-wrapper');
    if (categoriesElement) {
      const targetPosition = categoriesElement.getBoundingClientRect().top + window.pageYOffset - 70;
      const startPosition = window.pageYOffset;
      const distance = targetPosition - startPosition;
      const duration = 1000;
      let startTime = null;

      const animation = (currentTime) => {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        const ease = 0.5 - Math.cos(progress * Math.PI) / 2;

        window.scrollTo(0, startPosition + distance * ease);

        if (timeElapsed < duration) {
          requestAnimationFrame(animation);
        }
      };

      requestAnimationFrame(animation);
    }
  };

  const handleCategoryScroll = (catName, direction) => {
    const container = scrollRefs.current[catName];
    if (container) {
      const scrollAmount = container.clientWidth * 0.85;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleSelectProductFromDropdown = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFocused(false);
    setSearchActive(false);
    if (onOpenProduct) {
      onOpenProduct(item);
    }
  };

  return (
    <>
      <div className={`shop-dark-overlay ${isFocused ? 'active' : ''}`} onClick={() => { setIsFocused(false); setSearchActive(false); }} />

      <div className={`shop-page ${isFocused ? 'searching' : ''}`}>
        <div className={`search-container ${isFocused ? 'search-container-focused' : ''}`}>
          <FontAwesomeIcon icon={faMagnifyingGlass} className="search-icon" />
          <input 
            type="text" 
            ref={inputRef}
            className="shop-search-bar" 
            placeholder={lang === 'it' ? 'Cerca prodotti...' : 'Search products...'} 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsFocused(true);
              setSearchActive(true);
            }}
            onFocus={() => {
              setIsFocused(true);
              setSearchActive(true);
            }}
            onBlur={(e) => {
              if (e.relatedTarget && e.relatedTarget.closest('.search-dropdown-bar')) {
                return;
              }
            }}
            onKeyDown={handleKeyDown}
          />
          {searchQuery && (
            <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
              <FontAwesomeIcon icon={faXmark} />
            </button>
          )}

          {isFocused && searchQuery.trim() !== '' && (
            <div className="search-dropdown-bar" tabIndex="-1">
              {displayedResults.length > 0 ? (
                <>
                  {displayedResults.map(item => (
                    <div 
                      key={item.id} 
                      className="search-drop-item"
                      onMouseDown={(e) => handleSelectProductFromDropdown(e, item)}
                    >
                      <div className="search-drop-img-box">
                        <img src={item.image} alt={item.title} className="search-drop-img" />
                      </div>
                      <div className="search-drop-info">
                        <span className="search-drop-title">{item.title}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className="search-drop-price">${item.price.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="search-drop-actions" onMouseDown={(e) => e.stopPropagation()}>
                        <button className="search-drop-cart-btn" title="Add to Cart" onClick={(e) => onAddToCart(e, item)}>
                          <FontAwesomeIcon icon={faCartPlus} />
                        </button>
                        <button className="search-drop-buy-btn" title="Buy Now" onClick={(e) => handleBuyNowDirect(e, item)}>
                          <FontAwesomeIcon icon={faBolt} /> {lang === 'it' ? 'Acquista' : 'Buy'}
                        </button>
                      </div>
                    </div>
                  ))}

                  {hasMoreResults && (
                    <div 
                      className="search-drop-more"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setIsFocused(false);
                        setSearchActive(false);
                        navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                      }}
                    >
                      <span>{lang === 'it' ? 'Ci sono altri risultati... Premi Invio' : "There's more results... Press Enter to view all"}</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="search-drop-empty">
                  <span>{lang === 'it' ? 'Nessun prodotto trovato' : 'No products found'}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="explore-shop-banner" onClick={handleExploreClick}>
          <span className="explore-text">{lang === 'it' ? 'Esplora il Negozio' : 'Explore Shop'}</span>
          <button className="explore-arrow-btn">
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>

        <div id="categories-section-wrapper" className="categories-wrapper">
          {categories.length > 0 ? (
            categories.map((cat, catIndex) => (
              <div key={catIndex} className="category-section">
                <div className="category-header">
                  <h2>{cat.name}</h2>
                  <span className="see-all">{lang === 'it' ? 'Vedi Tutti' : 'See All'}</span>
                </div>

                <div className="category-scroll-container">
                  <button 
                    className="category-scroll-btn left" 
                    onClick={() => handleCategoryScroll(cat.name, 'left')}
                    aria-label="Scroll left"
                  >
                    <FontAwesomeIcon icon={faChevronLeft} />
                  </button>

                  <div 
                    className="product-horizontal-scroll"
                    ref={(el) => (scrollRefs.current[cat.name] = el)}
                  >
                    {cat.items.map((productObj) => (
                      <div 
                        key={productObj.id} 
                        className="product-card"
                        onClick={() => {
                          if (onOpenProduct) onOpenProduct(productObj);
                        }}
                      >
                        <div className="product-image-container" style={{ aspectRatio: '1 / 1' }}>
                          <img src={productObj.image} alt={productObj.title} className="product-img" style={{ objectFit: 'contain' }} />
                          <span className="product-badge">Volt</span>
                        </div>
                        
                        <div className="product-info">
                          <h4 className="product-title">{productObj.title}</h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <p className="product-price" style={{ margin: 0 }}>${productObj.price.toFixed(2)}</p>
                          </div>
                        </div>

                        <div className="product-actions" onClick={(e) => e.stopPropagation()}>
                          <button className="btn-add-cart" title="Add to Cart" onClick={(e) => onAddToCart(e, productObj)}>
                            <FontAwesomeIcon icon={faCartPlus} />
                          </button>
                          <button className="btn-buy-now" onClick={(e) => handleBuyNowDirect(e, productObj)}>
                            <FontAwesomeIcon icon={faBolt} /> {lang === 'it' ? 'Acquista' : 'Buy'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button 
                    className="category-scroll-btn right" 
                    onClick={() => handleCategoryScroll(cat.name, 'right')}
                    aria-label="Scroll right"
                  >
                    <FontAwesomeIcon icon={faChevronRight} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '50px', color: '#64748b' }}>
              <p>{lang === 'it' ? 'Attendere prego...' : 'Please wait...'}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}