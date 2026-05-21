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

      {/* ABOUT US */}
      <section id="features" className="landing-section" style={{ background: '#FFF8E7' }}>
        <div className="landing-container">
          <div className="section-header" style={{ marginBottom: 40 }}>
            <div className="section-subtitle">About Us</div>
            <h2 className="section-title">YOUR TRUSTED <span>SERVICE CENTER</span></h2>
          </div>
          <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center', fontSize: 16, color: '#555', lineHeight: 1.8 }}>
            <p style={{ marginBottom: 32 }}>
              Welcome to RKS Xerox and Computer Center! We are your premier one-stop destination for high-quality printing, scanning, lamination, and a wide array of online computer services. With years of experience and a commitment to customer satisfaction, we ensure fast, reliable, and affordable solutions for all your personal and business needs.
            </p>
            <div style={{ display: 'inline-block', textAlign: 'left', background: '#fff', padding: '32px 48px', borderRadius: 20, boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
              <h4 style={{ fontSize: 18, fontWeight: 800, color: '#111', marginBottom: 20, textAlign: 'center' }}>⏱️ Opening Hours</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 48, marginBottom: 12 }}>
                <span style={{ fontWeight: 600, color: '#111' }}>Monday - Saturday</span>
                <span style={{ color: '#FFC107', fontWeight: 800 }}>8:30 AM - 8:00 PM</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 48 }}>
                <span style={{ fontWeight: 600, color: '#111' }}>Sunday</span>
                <span style={{ color: '#FFC107', fontWeight: 800 }}>10:00 AM - 5:00 PM</span>
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
