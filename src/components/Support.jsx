import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheckCircle, 
  faCircleExclamation, 
  faXmark, 
  faPaperPlane 
} from '@fortawesome/free-solid-svg-icons';
import emailjs from '@emailjs/browser';
import './Support.css';

export default function Support({ lang }) {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalState, setModalState] = useState(null);
  const [isClosing, setIsClosing] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim() || !message.trim()) {
      setModalState('error');
      return;
    }

    setIsSubmitting(true);

    const templateParams = {
      user_email: email,
      user_phone: phone.trim() ? phone : 'Not provided',
      support_message: message,
      to_email: "mazenfox594@gmail.com"
    };

    emailjs.send('service_q02axo5', 'template_88hqzce', templateParams, 'jY8rRnlQewJ2YaXP9')
      .then((response) => {
        setIsSubmitting(false);
        setEmail('');
        setPhone('');
        setMessage('');
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

  return (
    <div className="support-page">
      <div className="support-header">
        <h2>{lang === 'it' ? 'Aiuto e Supporto' : 'Help & Support'}</h2>
        <p>{lang === 'it' ? 'Hai un problema con il tuo ordine? Inviaci un messaggio e ti risponderemo al più presto.' : 'Having an issue with your order or product? Drop us a message and our team will get back to you shortly.'}</p>
      </div>

      <div className="support-form-card">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="support-input-group">
            <label>{lang === 'it' ? 'Indirizzo Email' : 'Email Address'}</label>
            <input 
              type="email" 
              placeholder="name@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="support-input-group">
            <label>{lang === 'it' ? 'Numero di Telefono (opzionale)' : 'Phone Number (optional)'}</label>
            <input 
              type="tel" 
              placeholder="phone number..." 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="support-input-group">
            <label>{lang === 'it' ? 'Qual è il problema riscontrato?' : 'What is the problem causing you?'}</label>
            <textarea 
              placeholder={lang === 'it' ? 'Descrivi il tuo problema in dettaglio...' : 'Describe your issue in detail...'} 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            className="support-submit-btn" 
            disabled={isSubmitting}
          >
            <FontAwesomeIcon icon={faPaperPlane} style={{ marginRight: '8px' }} />
            {isSubmitting 
              ? (lang === 'it' ? 'Invio ticket...' : 'Sending Ticket...') 
              : (lang === 'it' ? 'Invia Ticket' : 'Submit Ticket')}
          </button>
        </form>
      </div>

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
                <h3>{lang === 'it' ? 'Ticket Inviato con Successo!' : 'Ticket Sent Successfully!'}</h3>
                <p>{lang === 'it' ? 'Grazie per averci contattato. Abbiamo ricevuto il tuo messaggio.' : 'Thank you for reaching out. We have received your message and we will contact you soon.'}</p>
                <button className="order-modal-back-btn" onClick={closeModal}>
                  {lang === 'it' ? 'Ho capito' : 'Got It'}
                </button>
              </>
            ) : (
              <>
                <div className="order-modal-icon-container error">
                  <FontAwesomeIcon icon={faCircleExclamation} />
                </div>
                <h3>{lang === 'it' ? 'Informazioni Mancanti!' : 'Missing Information!'}</h3>
                <p>{lang === 'it' ? 'Assicurati di inserire email e messaggio prima di inviare.' : 'Please make sure to fill in your email address and message properly before submitting.'}</p>
                <button className="order-modal-back-btn" onClick={closeModal}>
                  {lang === 'it' ? 'Riprova' : 'Try Again'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}