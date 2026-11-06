import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faXmark, faCartPlus, faBolt } from '@fortawesome/free-solid-svg-icons';
import { client, urlFor } from '../sanity';
import Empty from '../assets/empty.png';
import './Shop.css';

export default function Search({ onAddToCart, setCartItems, onOpenProduct, isDiscountApplied, lang }) {
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const initialQuery = queryParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [isFocused, setIsFocused] = useState(false);
  const [products, setProducts] = useState([]);
  const searchRef = useRef(null);

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

            const localizedTitle = lang === 'it' && item.nameIt ? item.nameIt : (item.name || 'Unnamed Product');
            const localizedDesc = lang === 'it' && item.descriptionIt ? item.descriptionIt : (item.description || 'Premium high-performance item.');

            return {
              id: item._id,
              category: item.category || 'General',
              title: localizedTitle,
              price: baseP,
              originalPrice: baseP,
              image: mainImgUrl,
              images: carouselUrls,
              description: localizedDesc
            };
          });
          setProducts(formatted);
        }
      })
      .catch((err) => console.error("Sanity fetch error:", err));
  }, [lang]);

  useEffect(() => {
    setSearchQuery(queryParams.get('q') || '');
  }, [location.search]);

  const filteredProducts = searchQuery.trim() === '' 
    ? products 
    : products.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const dropdownResults = searchQuery.trim() === '' ? products.slice(0, 3) : filteredProducts.slice(0, 3);
  const hasMoreResults = filteredProducts.length > 3;

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (searchQuery.trim()) {
        setIsFocused(false);
        navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      }
    }
  };

  const handleBuyNow = (e, product) => {
    e.stopPropagation();
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    navigate('/cart');
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="search-page-wrapper">
      <div className={`shop-dark-overlay ${isFocused ? 'active' : ''}`} />

      <div 
        className={`search-container ${isFocused ? 'search-container-focused' : ''}`} 
        ref={searchRef}
        style={{ position: 'relative' }}
      >
        <FontAwesomeIcon icon={faMagnifyingGlass} className="search-icon" />
        <input 
          type="text" 
          className="shop-search-bar" 
          placeholder={lang === 'it' ? 'Cerca prodotti...' : 'Search products...'} 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
        />
        {searchQuery && (
          <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        )}

        {isFocused && (
          <div className="search-dropdown-bar" style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, width: '100%', zIndex: 3005 }}>
            {dropdownResults.length > 0 ? (
              <>
                {dropdownResults.map(item => (
                  <div 
                    key={item.id} 
                    className="search-drop-item"
                    onClick={() => {
                      setIsFocused(false);
                      if (onOpenProduct) onOpenProduct(item);
                    }}
                  >
                    <div className="search-drop-img-box">
                      <img src={item.image || Empty} alt={item.title} className="search-drop-img" />
                    </div>
                    <div className="search-drop-info">
                      <span className="search-drop-title">{item.title}</span>
                      <span className="search-drop-price">${(item.price).toFixed(2)}</span>
                    </div>
                    <div className="search-drop-actions" onClick={(e) => e.stopPropagation()}>
                      <button className="search-drop-cart-btn" title={lang === 'it' ? 'Aggiungi al carrello' : 'Add to Cart'} onClick={(e) => onAddToCart(e, item)}>
                        <FontAwesomeIcon icon={faCartPlus} />
                      </button>
                      <button className="search-drop-buy-btn" title={lang === 'it' ? 'Acquista ora' : 'Buy Now'} onClick={(e) => handleBuyNow(e, item)}>
                        <FontAwesomeIcon icon= {faBolt} /> {lang === 'it' ? 'Acquista' : 'Buy'}
                      </button>
                    </div>
                  </div>
                ))}

                {hasMoreResults && (
                  <div 
                    className="search-drop-more"
                    onClick={() => {
                      setIsFocused(false);
                      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                    }}
                  >
                    <span>{lang === 'it' ? 'Premi Invio per visualizzare tutti i risultati' : 'Press Enter to view all results'}</span>
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

      <div style={{ marginTop: '20px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'inherit' }}>
          {lang === 'it' ? 'Risultati della Ricerca' : 'Search Results'}
        </h2>
        <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
          {initialQuery 
            ? (lang === 'it' ? `Risultati per "${initialQuery}"` : `Results for "${initialQuery}"`) 
            : (lang === 'it' ? 'Tutti i prodotti' : 'All Products')}
        </p>
      </div>

      <div className="search-results-grid">
        {filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
            <div 
              key={product.id} 
              className="product-card" 
              onClick={() => {
                if (onOpenProduct) onOpenProduct(product);
              }}
            >
              <div className="product-image-container">
                <img src={product.image || Empty} alt={product.title} className="product-img" />
                <span className="product-badge">Volt</span>
              </div>
              
              <div className="product-info">
                <h4 className="product-title">{product.title}</h4>
                <p className="product-price">${(product.price).toFixed(2)}</p>
              </div>

              <div className="product-actions" onClick={(e) => e.stopPropagation()}>
                <button className="btn-add-cart" title={lang === 'it' ? 'Aggiungi' : 'Add to Cart'} onClick={(e) => onAddToCart(e, product)}>
                  <FontAwesomeIcon icon={faCartPlus} />
                </button>
                <button className="btn-buy-now" onClick={(e) => handleBuyNow(e, product)}>
                  <FontAwesomeIcon icon={faBolt} /> {lang === 'it' ? 'Acquista' : 'Buy'}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#8e95a9' }}>
            <p>{lang === 'it' ? 'Nessun prodotto corrisponde alla tua ricerca.' : 'No products match your search query.'}</p>
          </div>
        )}
      </div>
    </div>
  );
}