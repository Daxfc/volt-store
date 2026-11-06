import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTicket, faRobot, faCheck, faXmark, faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
import { client } from '../sanity';
import AIAssistant from './AIAssistant';
import './ActionMenu.css';

export default function ActionMenu({ setIsDiscountApplied, darkMode, lang }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [promoMessage, setPromoMessage] = useState('');
  const [statusType, setStatusType] = useState(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleOpenPromoModal = () => {
    setIsOpen(false);
    setShowPromoModal(true);
    setPromoMessage('');
    setPromoCodeInput('');
    setStatusType(null);
  };

  const handleOpenAIModal = () => {
    setIsOpen(false);
    setShowAIModal(true);
  };

  const handleApplyPromo = async (e) => {
    e.preventDefault();
    const enteredCode = promoCodeInput.trim().toLowerCase();
    if (!enteredCode) return;

    const isAlreadyRedeemed = localStorage.getItem('volt_promo_redeemed');
    if (isAlreadyRedeemed === 'true') {
      setStatusType('error');
      setPromoMessage(
        lang === 'it' 
          ? 'Codice già utilizzato! Puoi usarlo una sola volta.' 
          : 'Promo code already redeemed! You can only use it once.'
      );
      return;
    }

    try {
      const activePromo = await client.fetch(`*[_type == "promoCode" && active == true][0]`);
      const targetCode = activePromo ? activePromo.code.trim().toLowerCase() : 'volt';

      if (enteredCode === targetCode) {
        setIsDiscountApplied(true);
        localStorage.setItem('volt_discount_applied', JSON.stringify(true));
        localStorage.setItem('volt_promo_redeemed', 'true');
        setStatusType('success');
        setPromoMessage(
          lang === 'it' 
            ? 'Successo! Sconto del 20% applicato.' 
            : 'Success! 20% discount applied to all items.'
        );
      } else {
        setStatusType('error');
        setPromoMessage(
          lang === 'it' 
            ? 'Codice promozionale non valido.' 
            : 'Invalid promo code. Please try again.'
        );
      }
    } catch (err) {
      if (enteredCode === 'volt') {
        setIsDiscountApplied(true);
        localStorage.setItem('volt_discount_applied', JSON.stringify(true));
        localStorage.setItem('volt_promo_redeemed', 'true');
        setStatusType('success');
        setPromoMessage(
          lang === 'it' 
            ? 'Successo! Sconto del 20% applicato.' 
            : 'Success! 20% discount applied.'
        );
      } else {
        setStatusType('error');
        setPromoMessage(
          lang === 'it' 
            ? 'Codice non valido.' 
            : 'Invalid promo code.'
        );
      }
    }
  };

  return (
    <>
      <div className="action-menu-container">
        {isOpen && (
          <div className="action-popup-options">
            <button className="action-popup-btn" onClick={handleOpenAIModal} title="Volt AI Assistant">
              <FontAwesomeIcon icon={faRobot} />
            </button>
            <button className="action-popup-btn" onClick={handleOpenPromoModal} title="Redeem Promo Code">
              <FontAwesomeIcon icon={faTicket} />
            </button>
          </div>
        )}
        <button className={`action-fab-btn ${isOpen ? 'open' : ''}`} onClick={toggleMenu} title="Toggle Menu">
          <FontAwesomeIcon icon={faPlus} className="fab-plus-icon" />
        </button>
      </div>

      {showPromoModal && (
        <div className={`ai-modal-overlay ${darkMode ? 'dark-mode' : ''}`} onClick={() => setShowPromoModal(false)}>
          <div className="promo-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="promo-close-btn" onClick={() => setShowPromoModal(false)}>
              <FontAwesomeIcon icon={faXmark} />
            </button>

            <div className="promo-header-center">
              <FontAwesomeIcon icon={faTicket} style={{ fontSize: '32px', color: '#0066ff', marginBottom: '4px' }} />
              <h3>{lang === 'it' ? 'Riscatta Codice Promo' : 'Redeem Promo Code'}</h3>
              <p>{lang === 'it' ? 'Inserisci il codice per applicare lo sconto' : 'Enter your code to apply discount'}</p>
            </div>

            <form onSubmit={handleApplyPromo} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input 
                type="text" 
                className={`redeem-input-field ${statusType === 'error' ? 'error-border' : ''}`}
                placeholder={lang === 'it' ? 'Inserisci codice promo...' : 'Enter promo code...'} 
                value={promoCodeInput}
                onChange={(e) => setPromoCodeInput(e.target.value)}
                autoFocus
              />
              <button type="submit" className="redeem-submit-btn">
                {lang === 'it' ? 'Applica Codice' : 'Apply Code'}
              </button>
            </form>

            {promoMessage && (
              <p className={`redeem-msg-text ${statusType}`}>
                <FontAwesomeIcon icon={statusType === 'success' ? faCheck : faCircleExclamation} style={{ marginRight: '6px' }} />
                {promoMessage}
              </p>
            )}
          </div>
        </div>
      )}

      <AIAssistant isOpen={showAIModal} onClose={() => setShowAIModal(false)} darkMode={darkMode} lang={lang} />
    </>
  );
}