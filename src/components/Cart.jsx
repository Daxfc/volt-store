import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTrashCan as faTrashRegular,
  faCreditCard as faCreditCardSolid,
  faMoneyBillWave as faCashSolid,
  faLock,
  faWallet,
  faTrash,
  faCheckCircle,
  faCircleExclamation,
  faXmark,
  faArrowLeft,
  faLocationDot
} from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import './Cart.css';

export default function Cart({ cartItems, setCartItems, lang, isDiscountApplied, setIsDiscountApplied, onTriggerLoading }) {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalState, setModalState] = useState(null);
  const [isClosing, setIsClosing] = useState(false);

  const [manualLocationModal, setManualLocationModal] = useState(false);
  const [manualLocationInput, setManualLocationInput] = useState('');

  const handleQuantityChange = (id, delta) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const handleRemoveItem = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleCardNumberChange = (e) => {
    const rawVal = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formattedVal = rawVal.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formattedVal);
  };

  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length >= 3) {
      val = val.slice(0, 2) + '/' + val.slice(2, 4);
    } else if (val.length >= 2) {
      val = val.slice(0, 2);
    }
    setCardExpiry(val);
  };

  const handleCvvChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 3);
    setCardCvv(val);
  };

  const subtotal = cartItems.reduce((acc, item) => {
    const itemPrice = item.originalPrice || item.price || 99.99;
    return acc + (itemPrice * item.quantity);
  }, 0);

  const discountAmount = isDiscountApplied ? subtotal * 0.20 : 0;
  const discountedSubtotal = subtotal - discountAmount;
  const shipping = subtotal > 0 ? 5.00 : 0;
  const total = subtotal > 0 ? discountedSubtotal + shipping : 0;

  const handleCompleteOrder = () => {
    if (cartItems.length === 0) {
      setModalState('error');
      return;
    }

    if (paymentMethod === 'card') {
      const rawCardNum = cardNumber.replace(/\s/g, '');
      if (rawCardNum.length < 16 || cardExpiry.length < 5 || cardCvv.length < 3) {
        setModalState('card-error');
        return;
      }
    }

    setIsSubmitting(true);

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const mapLink = `https://www.google.com/maps?q=${lat},${lng}`;
          sendEmailWithData(mapLink, true);
        },
        (error) => {
          setIsSubmitting(false);
          setManualLocationModal(true);
        },
        { timeout: 10000 }
      );
    } else {
      setIsSubmitting(false);
      setManualLocationModal(true);
    }
  };

  const handleManualLocationSubmit = () => {
    if (!manualLocationInput.trim()) return;
    setManualLocationModal(false);
    setIsSubmitting(true);
    sendEmailWithData(manualLocationInput.trim(), false);
  };

  const sendEmailWithData = (locationInfo, isMapUrl) => {
    const itemsDetails = cartItems.map(item => {
      const itemPrice = item.originalPrice || item.price || 99.99;
      return `${item.title} (Qty: ${item.quantity}) - $${(itemPrice * item.quantity).toFixed(2)}`;
    }).join('\n');

    const serviceId = isMapUrl ? "service_niiottp" : "service_0mi9w8c";
    const templateId = isMapUrl ? "template_ppbx0kv" : "template_w010zyc";
    const publicKey = isMapUrl ? "jY8rRnlQewJ2YaXP9" : "I1peVrXSBN13zUklH";

    const templateParams = {
      to_email: "mazenfox594@gmail.com",
      total_amount: `$${total.toFixed(2)}`,
      payment_method: paymentMethod,
      cart_items: itemsDetails,
      customer_location: locationInfo
    };

    emailjs.send(serviceId, templateId, templateParams, publicKey)
      .then((response) => {
        setIsSubmitting(false);
        setCartItems([]);
        if (setIsDiscountApplied) {
          setIsDiscountApplied(false);
          localStorage.removeItem('volt_discount_applied');
        }
        setModalState('success');
      })
      .catch((err) => {
        setIsSubmitting(false);
        setModalState('error');
      });
  };

  const closeModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setModalState(null);
      setIsClosing(false);
    }, 200);
  };

  const handleBackToShop = () => {
    setIsClosing(true);
    setTimeout(() => {
      setModalState(null);
      setIsClosing(false);
      if (onTriggerLoading) {
        onTriggerLoading(() => {
          navigate('/');
        });
      } else {
        navigate('/');
      }
    }, 200);
  };

  return (
    <div className="cart-page">
      <div className="cart-header-title">
        <div className="cart-title-left">
          <h2>{lang === 'it' ? 'Il Mio Carrello' : 'My Cart'}</h2>
          <span className="cart-item-count">
            {cartItems.reduce((acc, item) => acc + item.quantity, 0)} {lang === 'it' ? 'articoli' : 'items'}
          </span>
        </div>
        {cartItems.length > 0 && (
          <button className="clear-cart-btn" onClick={handleClearCart}>
            <FontAwesomeIcon icon={faTrash} />
            <span>{lang === 'it' ? 'Svuota' : 'Clear Cart'}</span>
          </button>
        )}
      </div>

      {cartItems.length === 0 ? (
        <div className="cart-empty-state">
          <h3>{lang === 'it' ? "Il carrello è vuoto" : 'Your cart is empty'}</h3>
          <p>{lang === 'it' ? "Non hai ancora aggiunto nulla al carrello." : "Looks like you haven't added anything to your cart yet."}</p>
          <Link 
            to="/" 
            className="cart-shop-now-btn"
            onClick={(e) => {
              if (onTriggerLoading) {
                e.preventDefault();
                onTriggerLoading(() => {
                  navigate('/');
                });
              }
            }}
          >
            {lang === 'it' ? 'Inizia a fare acquisti' : 'Start Shopping'}
          </Link>
        </div>
      ) : (
        <div className="cart-content-wrapper">
          <div className="cart-items-scroll-container">
            <div className="cart-items-list">
              {cartItems.map(item => {
                const itemPrice = item.originalPrice || item.price || 99.99;

                return (
                  <div key={item.id} className="cart-item-card">
                    <div className="cart-item-img-container">
                      <img src={item.image} alt={item.title} className="cart-item-img" />
                    </div>
                    <div className="cart-item-details">
                      <h4 className="cart-item-title">{item.title}</h4>
                      <p className="cart-item-price">${itemPrice.toFixed(2)}</p>
                      
                      <div className="cart-item-controls">
                        <div className="cart-quantity-selector">
                          <button onClick={() => handleQuantityChange(item.id, -1)}>-</button>
                          <span>{item.quantity}</span>
                          <button onClick={() => handleQuantityChange(item.id, 1)}>+</button>
                        </div>
                        <button className="cart-remove-btn" onClick={() => handleRemoveItem(item.id)}>
                          <FontAwesomeIcon icon={faTrashRegular} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="cart-summary-section">
            <div className="cart-summary-card">
              <h3>{lang === 'it' ? "Riepilogo dell'ordine" : 'Order Summary'}</h3>
              
              <div className="summary-row">
                <span>{lang === 'it' ? 'Subtotale' : 'Subtotal'}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isDiscountApplied && (
                    <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '13px', fontWeight: '600' }}>
                      ${subtotal.toFixed(2)}
                    </span>
                  )}
                  <span>${discountedSubtotal.toFixed(2)}</span>
                </div>
              </div>

              {isDiscountApplied && (
                <div className="summary-row" style={{ color: '#10b981', fontSize: '13px', fontWeight: '600' }}>
                  <span>{lang === 'it' ? 'Sconto Promo (20%)' : 'Promo Discount (20%)'}</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="summary-row">
                <span>{lang === 'it' ? 'Spedizione' : 'Shipping'}</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-row total-row">
                <span>{lang === 'it' ? 'Totale' : 'Total'}</span>
                <span>${total.toFixed(2)}</span>
              </div>

              <div className="payment-method-container">
                <h4>{lang === 'it' ? 'Seleziona Metodo di Pagamento' : 'Select Payment Method'}</h4>
                <div className="payment-options-grid">
                  <button 
                    type="button" 
                    className={`payment-option-btn ${paymentMethod === 'card' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('card')}
                  >
                    <FontAwesomeIcon icon={faCreditCardSolid} />
                    <span>{lang === 'it' ? 'Carta' : 'Credit Card'}</span>
                  </button>
                  <button 
                    type="button" 
                    className={`payment-option-btn ${paymentMethod === 'paypal' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('paypal')}
                  >
                    <FontAwesomeIcon icon={faWallet} />
                    <span>PayPal</span>
                  </button>
                  <button 
                    type="button" 
                    className={`payment-option-btn ${paymentMethod === 'cash' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('cash')}
                  >
                    <FontAwesomeIcon icon={faCashSolid} />
                    <span>{lang === 'it' ? 'Contrassegno' : 'Cash'}</span>
                  </button>
                </div>

                {paymentMethod === 'card' && (
                  <div className="card-input-group">
                    <input 
                      type="text" 
                      placeholder={lang === 'it' ? 'Numero Carta (4111 2222...)' : 'Card Number (4111 2222 3333 4444)'} 
                      value={cardNumber}
                      maxLength="19"
                      onChange={handleCardNumberChange}
                    />
                    <div className="card-row-inputs">
                      <input 
                        type="text" 
                        placeholder="MM/YY" 
                        value={cardExpiry}
                        maxLength="5"
                        onChange={handleExpiryChange}
                      />
                      <input 
                        type="text" 
                        placeholder="CVV" 
                        value={cardCvv}
                        maxLength="3"
                        onChange={handleCvvChange}
                      />
                    </div>
                    <div className="test-badge-notice">
                      <FontAwesomeIcon icon={faLock} />
                      <span>{lang === 'it' ? 'Nota: Sito di test. Non inserire vere informazioni!' : 'Note: This website is just a test. Do not put your real card information!'}</span>
                    </div>
                  </div>
                )}

                {paymentMethod === 'paypal' && (
                  <div className="paypal-notice-box">
                    <p>{lang === 'it' ? 'Verrai reindirizzato a PayPal in modo sicuro.' : 'You will be redirected to PayPal securely to complete your payment.'}</p>
                  </div>
                )}

                {paymentMethod === 'cash' && (
                  <div className="cash-notice-box">
                    <p>{lang === 'it' ? "Si prega di preparare l'importo esatto alla consegna." : 'Please keep exact change ready upon delivery.'}</p>
                  </div>
                )}
              </div>

              <button 
                className="checkout-submit-btn" 
                onClick={handleCompleteOrder}
                disabled={isSubmitting}
              >
                {isSubmitting 
                  ? (lang === 'it' ? "Invio dell'ordine..." : 'Sending Order...') 
                  : (lang === 'it' ? 'Completa Ordine' : 'Complete Order')}
              </button>
            </div>
          </div>
        </div>
      )}

      {manualLocationModal && (
        <div className="order-modal-overlay">
          <div className="order-modal-card" style={{ position: 'relative' }}>
            <button 
              className="order-modal-close-btn" 
              onClick={() => setManualLocationModal(false)}
              style={{ position: 'absolute', top: '16px', right: '16px' }}
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>

            <div className="order-modal-icon-container" style={{ background: 'rgba(0, 102, 255, 0.1)', color: '#0066ff' }}>
              <FontAwesomeIcon icon={faLocationDot} />
            </div>
            <h3>{lang === 'it' ? 'Posizione non disponibile' : 'Location Not Available'}</h3>
            <p style={{ fontSize: '13px', lineHeight: '1.5' }}>
              {lang === 'it' 
                ? "Il tuo dispositivo non ha il GPS o hai negato l'accesso alla posizione. Scrivi la tua posizione qui:" 
                : "Sorry we couldn't know your location, your device doesn't have GPS or you denied access to location. Please write your location here:"}
            </p>
            <input 
              type="text" 
              className="manual-location-input-field"
              placeholder={lang === 'it' ? 'Città, strada, edificio' : 'City, street, building'} 
              value={manualLocationInput}
              onChange={(e) => setManualLocationInput(e.target.value)}
            />
            <button className="order-modal-back-btn" onClick={handleManualLocationSubmit}>
              {lang === 'it' ? 'Invia Ordine' : 'Submit & Complete Order'}
            </button>
            <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px', textAlign: 'center', lineHeight: '1.4' }}>
              {lang === 'it' 
                ? "Se il tuo dispositivo è dotato di GPS, assicurati di consentire l'accesso e di attivarlo dal tuo dispositivo, qui puoi aggiungere anche un link a Google Maps." 
                : "If your device does have GPS please make sure to allow access and turn it on from your device, you can also add google maps link here."}
            </p>
          </div>
        </div>
      )}

      {modalState && (
        <div className={`order-modal-overlay ${isClosing ? 'closing' : ''}`} onClick={closeModal}>
          <div className={`order-modal-card ${isClosing ? 'closing' : ''}`} onClick={(e) => e.stopPropagation()}>
            <button className="order-modal-close-btn" onClick={closeModal}>
              <FontAwesomeIcon icon={faXmark} />
            </button>

            {modalState === 'success' ? (
              <>
                <div className="order-modal-icon-container success">
                  <FontAwesomeIcon icon={faCheckCircle} />
                </div>
                <h3>{lang === 'it' ? 'Ordine Completato!' : 'Order Completed!'}</h3>
                <p>{lang === 'it' ? "Grazie per l'acquisto. Il tuo ordine è stato inoltrato." : 'Thank you for your purchase. Your order has been successfully placed.'}</p>
                <button className="order-modal-back-btn" onClick={handleBackToShop}>
                  <FontAwesomeIcon icon={faArrowLeft} /> {lang === 'it' ? 'Torna al Negozio' : 'Back to Shop'}
                </button>
              </>
            ) : modalState === 'card-error' ? (
              <>
                <div className="order-modal-icon-container error">
                  <FontAwesomeIcon icon={faCircleExclamation} />
                </div>
                <h3>{lang === 'it' ? 'Informazioni Mancanti!' : 'Missing Card Info!'}</h3>
                <p>{lang === 'it' ? "Assicurati di inserire numero carta, scadenza e CVV." : 'Please make sure to fill in your complete card info properly.'}</p>
                <button className="order-modal-back-btn" onClick={closeModal}>
                  {lang === 'it' ? 'Riprova' : 'Try Again'}
                </button>
              </>
            ) : (
              <>
                <div className="order-modal-icon-container error">
                  <FontAwesomeIcon icon={faCircleExclamation} />
                </div>
                <h3>{lang === 'it' ? 'Errore!' : 'Oops, Error!'}</h3>
                <p>{lang === 'it' ? "C'è stato un problema. Riprova." : 'There was an issue processing your order. Please try again.'}</p>
                <button className="order-modal-back-btn" onClick={closeModal}>
                  {lang === 'it' ? 'Ho capito' : 'Got It'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}