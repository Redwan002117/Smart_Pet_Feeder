import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient.ts';
import '../styles/Home.css';

const Home: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // If user is logged in, redirect to dashboard
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate('/dashboard');
      }
    };
    checkSession();
  }, [navigate]);

  return (
    <div className="home-container">
      <section className="hero">
        <div className="hero-content">
          <h1>Feed your pet effortlessly!</h1>
          <p>
            Smart Pet Feeder helps you care for your pets even when you're away.
            Schedule meals, monitor food levels, and feed remotely with our
            connected device.
          </p>
          <div className="hero-cta">
            <Link to="/signup" className="btn btn-primary btn-large">
              Get Started
            </Link>
            <Link to="/about" className="btn btn-outline btn-large">
              Learn More
            </Link>
          </div>
        </div>
        <div className="hero-image">
          <img src="/images/pet-feeder-hero.png" alt="Smart Pet Feeder Device" />
        </div>
      </section>

      <section className="features">
        <div className="section-header">
          <h2>Why Choose Smart Pet Feeder?</h2>
          <p>The complete solution for your pet's feeding needs</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <i className="icon-schedule"></i>
            </div>
            <h3>Custom Feeding Schedules</h3>
            <p>Create personalized feeding schedules for your pets based on their specific needs.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <i className="icon-mobile"></i>
            </div>
            <h3>Remote Control</h3>
            <p>Dispense food from anywhere using our mobile-friendly web application.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <i className="icon-notification"></i>
            </div>
            <h3>Real-time Alerts</h3>
            <p>Get notified when your pet is fed or when food levels are running low.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <i className="icon-chart"></i>
            </div>
            <h3>Feeding Analytics</h3>
            <p>Track your pet's consumption patterns and health with detailed reports.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <i className="icon-wifi"></i>
            </div>
            <h3>Easy Setup</h3>
            <p>Connect your device to WiFi in minutes with our guided setup process.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <i className="icon-multiple"></i>
            </div>
            <h3>Multiple Pets</h3>
            <p>Manage feeding schedules for multiple pets from a single dashboard.</p>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <div className="section-header">
          <h2>How It Works</h2>
          <p>Simple, reliable pet feeding in three easy steps</p>
        </div>

        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Connect Your Device</h3>
              <p>Set up your Smart Pet Feeder device and connect it to your home WiFi.</p>
            </div>
          </div>

          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Create Feeding Schedules</h3>
              <p>Set up regular feeding times or dispense food on-demand through the app.</p>
            </div>
          </div>

          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Monitor & Adjust</h3>
              <p>Track feeding history and make adjustments to keep your pet healthy.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="testimonials">
        <div className="section-header">
          <h2>Happy Pet Parents</h2>
          <p>See what our users have to say</p>
        </div>

        <div className="testimonial-carousel">
          <div className="testimonial-card">
            <div className="testimonial-content">
              <p>"Smart Pet Feeder has been a lifesaver during my business trips. I can make sure my cat is fed on time, every time!"</p>
            </div>
            <div className="testimonial-author">
              <img src="/images/testimonial-1.jpg" alt="Sarah J." />
              <div>
                <h4>Sarah J.</h4>
                <p>Cat Owner</p>
              </div>
            </div>
          </div>

          <div className="testimonial-card">
            <div className="testimonial-content">
              <p>"As a veterinarian, I recommend Smart Pet Feeder to pet owners who work long hours. It helps maintain consistent feeding times."</p>
            </div>
            <div className="testimonial-author">
              <img src="/images/testimonial-2.jpg" alt="Dr. Michael R." />
              <div>
                <h4>Dr. Michael R.</h4>
                <p>Veterinarian</p>
              </div>
            </div>
          </div>

          <div className="testimonial-card">
            <div className="testimonial-content">
              <p>"My dog has special dietary needs, and the Smart Pet Feeder allows me to control portion sizes precisely."</p>
            </div>
            <div className="testimonial-author">
              <img src="/images/testimonial-3.jpg" alt="James L." />
              <div>
                <h4>James L.</h4>
                <p>Dog Owner</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to simplify pet feeding?</h2>
          <p>Join thousands of happy pet owners using Smart Pet Feeder.</p>
          <Link to="/signup" className="btn btn-primary btn-large">
            Get Started Today
          </Link>
        </div>
      </section>

      <footer className="home-footer">
        <div className="footer-grid">
          <div className="footer-section">
            <h3>Smart Pet Feeder</h3>
            <p>The intelligent way to feed your pets, even when you're away.</p>
          </div>
          
          <div className="footer-section">
            <h4>Links</h4>
            <ul>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/features">Features</Link></li>
              <li><Link to="/pricing">Pricing</Link></li>
              <li><Link to="/support">Support</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Legal</h4>
            <ul>
              <li><Link to="/terms">Terms of Service</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/warranty">Warranty</Link></li>
              <li><Link to="/returns">Returns</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Contact</h4>
            <ul>
              <li>Email: support@petfeeder.com</li>
              <li>Phone: (555) 123-4567</li>
              <li>Address: 123 Pet Street, Animalville</li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Smart Pet Feeder. All rights reserved.</p>
          <div className="social-links">
            <a href="https://facebook.com" aria-label="Facebook"><i className="icon-facebook"></i></a>
            <a href="https://twitter.com" aria-label="Twitter"><i className="icon-twitter"></i></a>
            <a href="https://instagram.com" aria-label="Instagram"><i className="icon-instagram"></i></a>
            <a href="https://youtube.com" aria-label="YouTube"><i className="icon-youtube"></i></a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
