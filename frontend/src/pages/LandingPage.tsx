import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

export default function LandingPage() {
  return (
    <div className="landing-page">
      {/* HEADER */}
      <header className="landing-header">
        <div className="landing-container landing-header-inner">
          <div className="landing-logo">
            <img src="/image2.png" alt="RKS Xerox Logo" />
          </div>
          <nav className="landing-nav">
            <a href="#home" className="active">Home</a>
            <a href="#services">Services</a>
            <a href="#pricing">Pricing</a>
            <a href="#features">About Us</a>
            <a href="#contact">Contact</a>
            <a href="#location">Location</a>
          </nav>
          <div className="landing-header-actions">
            <a href="https://wa.me/918122778794" target="_blank" rel="noreferrer" className="landing-btn landing-btn-outline" style={{ color: '#25D366', borderColor: 'rgba(37,211,102,0.3)' }}>
              💬 WhatsApp
            </a>
            <a href="tel:+918122778794" className="landing-btn landing-btn-yellow">
              📞 Call Now
            </a>
            <Link to="/login" className="landing-btn landing-btn-outline" style={{ marginLeft: 8 }}>
              Staff Login
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section id="home" className="landing-hero">
        <div className="landing-container landing-hero-inner">
          <div>
            <h1 className="hero-title">
              <span className="highlight-yellow">RKS</span> XEROX<br />
              AND COMPUTER CENTER
            </h1>
            <div className="hero-services">
              Printing <span>•</span> Xerox <span>•</span> Scanning <span>•</span> Lamination <span>•</span> Online Services
            </div>
            <p className="hero-desc">
              One-stop destination for printing, photocopy, online forms, browsing, typing, and computer solutions.
            </p>
            <div className="hero-actions">
              <a href="https://wa.me/918122778794" target="_blank" rel="noreferrer" className="landing-btn landing-btn-green">
                WhatsApp Now
              </a>
              <a href="#contact" className="landing-btn landing-btn-yellow">
                📍 Visit Our Shop
              </a>
            </div>
          </div>
          <div>
            <div className="hero-graphic">
              <img src="/image1.png" alt="RKS Services Graphic" />
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section id="services" className="landing-section">
        <div className="landing-container">
          <div className="section-header">
            <div className="section-subtitle">Our Services</div>
            <h2 className="section-title">SERVICES <span>WE PROVIDE</span></h2>
          </div>
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">🖨️</div>
              <h3 className="service-title">XEROX</h3>
              <p className="service-desc">High quality black & white and color photocopy</p>
            </div>
            <div className="service-card">
              <div className="service-icon">📄</div>
              <h3 className="service-title">PRINTING</h3>
              <p className="service-desc">Fast & high quality printing black & white & color</p>
            </div>
            <div className="service-card">
              <div className="service-icon">📠</div>
              <h3 className="service-title">SCANNING</h3>
              <p className="service-desc">High resolution scanning with multiple formats</p>
            </div>
            <div className="service-card">
              <div className="service-icon">📋</div>
              <h3 className="service-title">LAMINATION</h3>
              <p className="service-desc">All types of lamination available here</p>
            </div>
            <div className="service-card">
              <div className="service-icon">🌐</div>
              <h3 className="service-title">ONLINE FORMS</h3>
              <p className="service-desc">All types of online forms filled here</p>
            </div>
            <div className="service-card">
              <div className="service-icon">⌨️</div>
              <h3 className="service-title">TYPING SERVICES</h3>
              <p className="service-desc">Fast and accurate typing for all documents</p>
            </div>
            <div className="service-card">
              <div className="service-icon">📸</div>
              <h3 className="service-title">PASSPORT PHOTOS</h3>
              <p className="service-desc">Instant passport & stamp size photos</p>
            </div>
            <div className="service-card">
              <div className="service-icon">📶</div>
              <h3 className="service-title">INTERNET SERVICES</h3>
              <p className="service-desc">Internet browsing, email & more services</p>
            </div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US & ACHIEVEMENTS */}
      <section id="features" className="landing-container">
        <div className="split-section">
          <div style={{ paddingRight: '40px' }}>
            <h2 className="split-title">WHY CHOOSE US?</h2>
            <div className="features-grid">
              <div className="feature-item">
                <div className="feature-icon">⚡</div>
                <div className="feature-content">
                  <h4>FAST SERVICE</h4>
                  <p>We value your time and deliver on time.</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">💰</div>
                <div className="feature-content">
                  <h4>AFFORDABLE PRICE</h4>
                  <p>Best quality services at reasonable prices.</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">🛡️</div>
                <div className="feature-content">
                  <h4>RELIABLE & TRUSTED</h4>
                  <p>Trusted by hundreds of happy customers.</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">👥</div>
                <div className="feature-content">
                  <h4>EXPERIENCED STAFF</h4>
                  <p>Skilled professionals always here to help you.</p>
                </div>
              </div>
            </div>
          </div>
          <div style={{ paddingLeft: '40px', borderLeft: '1px solid rgba(0,0,0,0.05)' }}>
            <h2 className="split-title">OUR ACHIEVEMENTS</h2>
            <div className="achievements-grid">
              <div className="achievement-card">
                <div className="achievement-icon">🖨️</div>
                <div className="achievement-number">10K+</div>
                <div className="achievement-label">Prints Done</div>
              </div>
              <div className="achievement-card">
                <div className="achievement-icon">👥</div>
                <div className="achievement-number">500+</div>
                <div className="achievement-label">Happy Customers</div>
              </div>
              <div className="achievement-card">
                <div className="achievement-icon">⭐</div>
                <div className="achievement-number">5+</div>
                <div className="achievement-label">Years Service</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact" className="landing-footer">
        <div className="landing-container footer-grid">
          <div>
            <div className="footer-logo">
              <img src="/image2.png" alt="RKS Logo" />
            </div>
            <p className="footer-desc">
              Your one-stop solution for all printing, xerox, computer and online services.
            </p>
          </div>
          <div>
            <h4 className="footer-col-title">QUICK LINKS</h4>
            <ul className="footer-links">
              <li><a href="#home">Home</a></li>
              <li><a href="#services">Services</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="#features">About Us</a></li>
              <li><a href="#contact">Contact</a></li>
              <li><Link to="/login" style={{ color: '#FFC107', fontWeight: 600 }}>Staff Login</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="footer-col-title">CONTACT US</h4>
            <div className="contact-item">
              <div className="contact-icon">📞</div>
              <div>8122778794</div>
            </div>
            <div className="contact-item">
              <div className="contact-icon">✉️</div>
              <div>rksxerox@gmail.com</div>
            </div>
            <div className="contact-item">
              <div className="contact-icon">📍</div>
              <div>Near Main Road,<br />Your City, State - 000000</div>
            </div>
          </div>
          <div id="location">
            <h4 className="footer-col-title">OUR LOCATION</h4>
            <a href="https://share.google/HjYj0vXmUT6mbV8ev" target="_blank" rel="noreferrer" className="map-placeholder">
              📍 View on Google Maps
            </a>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="landing-container">
            <div className="opening-hours">
              ⏱️ <strong>OPENING HOURS:</strong>
              <span>Monday - Saturday</span> <span className="time-badge">8:30 AM - 8:00 PM</span> | 
              <span>Sunday</span> <span className="time-badge">10:00 AM - 5:00 PM</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
