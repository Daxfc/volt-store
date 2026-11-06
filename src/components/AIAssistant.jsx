import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot, faXmark, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { GoogleGenAI } from '@google/genai';
import './AIAssistant.css';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export default function AIAssistant({ isOpen, onClose, darkMode, lang }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const welcomeText = lang === 'it' 
        ? 'Ciao! Sono Volt AI ⚡. Come posso aiutarti oggi?'
        : 'Hello there! What can I help you with?';
      
      setMessages([
        { role: 'model', text: welcomeText }
      ]);
    }
  }, [isOpen, lang]);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const getSmartFallbackReply = (text) => {
    const lower = text.trim().toLowerCase();

    const badWordsEn = ['fuck', 'shit', 'bitch', 'ass', 'damn', 'cunt', 'idiot', 'stupid'];
    const badWordsIt = ['cazzo', 'merda', 'stronzo', 'vaffanculo', 'idiota', 'stupido'];
    const isBadWord = [...badWordsEn, ...badWordsIt].some(word => lower === word || lower.includes(` ${word} `));

    if (isBadWord) {
      if (lang === 'it') {
        return "Mi dispiace se qualcosa non va! Se stai riscontrando un problema o hai bisogno di assistenza, visita la pagina 'Supporto' per parlare con il nostro team.";
      } else {
        return "I'm sorry if anything is frustrating you! If you're facing any issues, please reach out to our team through the 'Support' page so we can help.";
      }
    }

    const greetings = ['hi', 'hello', 'yoo', 'hey', 'sup', 'ciao', 'buongiorno', 'salve'];
    if (greetings.includes(lower) || greetings.some(g => lower.startsWith(g + ' '))) {
      if (lang === 'it') {
        return "Ciao! Come posso aiutarti con il nostro negozio oggi?";
      } else {
        return "Hello there! What can I help you with?";
      }
    }

    if (
      lower.includes('pant') || 
      lower.includes('shirt') || 
      lower.includes('shoe') || 
      lower.includes('machine') || 
      lower.includes('tool') || 
      lower.includes('want') || 
      lower.includes('looking for') ||
      lower.includes('buy') ||
      lower.includes('cerca') ||
      lower.includes('voglio')
    ) {
      if (lang === 'it') {
        return "Puoi esplorare il nostro negozio (Shop) o utilizzare la barra di ricerca in alto per trovare esattamente quello che desideri!";
      } else {
        return "You can explore our Shop or use the search bar at the top to find exactly what you're looking for!";
      }
    }

    if (lang === 'it') {
      if (lower.includes('codice') || lower.includes('riscatta') || lower.includes('sconto') || lower.includes('promo') || lower.includes('ticket') || lower.includes('card')) {
        return "Per riscattare un codice o una gift card, clicca sul pulsante 'Riscatta Codice' nel menu laterale (su PC) o nel menu d'azione (+ su mobile), inserisci il tuo codice e clicca su Applica!";
      }
      if (lower.includes('supporto') || lower.includes('aiuto') || lower.includes('contatto') || lower.includes('problema') || lower.includes('segnala')) {
        return "Per contattare il supporto o segnalare un problema, vai alla pagina 'Supporto' dalla barra di navigazione principale e inviaci un messaggio.";
      }
      if (lower.includes('lingua') || lower.includes('italiano') || lower.includes('inglese') || lower.includes('cambia')) {
        return "Puoi cambiare la lingua in qualsiasi momento dal selettore con la bandiera in alto a destra nell'intestazione (scegli tra Inglese e Italiano).";
      }
      if (lower.includes('ordine') || lower.includes('pagare') || lower.includes('negozio') || lower.includes('carrello')) {
        return "Per acquistare su Volt: seleziona il prodotto, aggiungilo al carrello o clicca su Acquista, poi vai al carrello, inserisci i dati di pagamento e conferma l'ordine!";
      }
      return "Puoi esplorare il nostro negozio (Shop) o utilizzare la barra di ricerca in alto per trovare esattamente quello che desideri!";
    } else {
      if (lower.includes('code') || lower.includes('redeem') || lower.includes('discount') || lower.includes('promo') || lower.includes('card') || lower.includes('ticket')) {
        return "To redeem a code or promo card, click on the 'Redeem Code' option in the sidebar (on Desktop) or the floating menu (+ button on Mobile), enter your code, and click Apply!";
      }
      if (lower.includes('support') || lower.includes('help') || lower.includes('contact') || lower.includes('issue') || lower.includes('report') || lower.includes('problem')) {
        return "To reach our support team or report an issue, go to the 'Support' tab in the navigation bar and submit your message directly to us.";
      }
      if (lower.includes('language') || lower.includes('lang') || lower.includes('english') || lower.includes('italian') || lower.includes('change')) {
        return "You can change the store language at any time using the flag dropdown selector at the top right of the screen (switch between English and Italian).";
      }
      if (lower.includes('order') || lower.includes('checkout') || lower.includes('pay') || lower.includes('shop') || lower.includes('cart')) {
        return "To shop at Volt: pick your item, click Add to Cart or Buy, open your Cart page, select your payment method, and complete your order!";
      }
      return "You can explore our Shop or use the search bar at the top to find exactly what you're looking for!";
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const storeContext = `
      You are the official AI assistant for the VOLT e-commerce store.
      - If the user says a greeting like Hi, Hello, Yoo, Hey, or Sup, respond with a friendly message like "Hello there! What can I help you with?".
      - If the user asks for items, clothing, pants, shirts, shoes, or products (e.g., "I want pants", "I want shirts"), always tell them to explore our Shop or use the search bar at the top to find what they are looking for.
      - If the user curses, uses bad language, or expresses anger/insults, politely apologize and let them know that if they are facing any issues, they can reach out to our team through the Support page.
      - For store queries, answer accurately in ${lang === 'it' ? 'Italian' : 'English'}:
        1. Redeem Code / Card: Explain clicking 'Redeem Code' in the sidebar or action menu, typing the code, and clicking Apply.
        2. Support / Report Issue: Direct them to the 'Support' page in the navigation.
        3. Language Switch: Explain using the flag selector dropdown at the top right header.
        4. Search Products / Categories: Direct them to use the search bar or explore the Shop.
        5. Shopping / Checkout: Explain picking items, adding to cart, opening cart, and completing payment.
      Keep answers concise and helpful.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userMsg,
        config: {
          systemInstruction: storeContext
        }
      });

      const aiReply = response.text || getSmartFallbackReply(userMsg);
      setMessages(prev => [...prev, { role: 'model', text: aiReply }]);
    } catch (err) {
      setTimeout(() => {
        const fallbackReply = getSmartFallbackReply(userMsg);
        setMessages(prev => [...prev, { role: 'model', text: fallbackReply }]);
      }, 300);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`ai-modal-overlay ${darkMode ? 'dark-mode' : ''}`} onClick={onClose}>
      <div className="ai-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="ai-header">
          <div className="ai-header-info">
            <div className="ai-robot-avatar">
              <FontAwesomeIcon icon={faRobot} />
            </div>
            <div>
              <h3>Volt Assistant</h3>
              <span className="ai-status-indicator">
                {lang === 'it' ? 'Online e Pronto' : 'Online & Ready'}
              </span>
            </div>
          </div>
          <button className="ai-close-btn" onClick={onClose}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <div className="ai-messages-container">
          {messages.map((msg, idx) => (
            <div key={idx} className={`ai-bubble ${msg.role}`}>
              {msg.text}
            </div>
          ))}
          {loading && (
            <div className="ai-bubble model typing">
              {lang === 'it' ? "Volt AI sta scrivendo..." : "Volt AI is thinking..."}
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <form className="ai-input-form" onSubmit={handleSendMessage}>
          <input 
            type="text" 
            placeholder={lang === 'it' ? 'Chiedi di ordini, sconti o supporto...' : 'Ask about orders, discounts, or support...'} 
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" disabled={loading} title="Send message">
            <FontAwesomeIcon icon={faPaperPlane} />
          </button>
        </form>
      </div>
    </div>
  );
}