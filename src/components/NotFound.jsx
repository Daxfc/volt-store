import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTriangleExclamation, faHouse } from '@fortawesome/free-solid-svg-icons';
import './NotFound.css';

export default function NotFound({ lang }) {
  return (
    <div className="not-found-container">
      <div className="not-found-card">
        <div className="not-found-icon-wrapper">
          <FontAwesomeIcon icon={faTriangleExclamation} />
        </div>
        <h1 className="not-found-code">404</h1>
        <h2 className="not-found-title">
          {lang === 'it' ? 'Pagina non trovata' : 'Page Not Found'}
        </h2>
        <p className="not-found-text">
          {lang === 'it'
            ? 'ERROR: Pagina non trovata. Assicurati di aver inserito un dominio o un indirizzo corretto.'
            : 'ERROR: Page not found. Please make sure you have entered a correct domain or address.'}
        </p>
        <Link to="/" className="not-found-home-btn">
          <FontAwesomeIcon icon={faHouse} />
          <span>{lang === 'it' ? 'Torna alla Home' : 'Back to Home'}</span>
        </Link>
      </div>
    </div>
  );
}