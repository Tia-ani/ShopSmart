import { useState, useEffect, useRef } from 'react';
import './landing.css';

// ─── SVG UI Icons (non-animal) ──────────────────────────────────
const PawIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="currentColor" className={className}>
    <ellipse cx="12" cy="20" rx="6" ry="8" />
    <ellipse cx="26" cy="12" rx="5.5" ry="7.5" />
    <ellipse cx="40" cy="12" rx="5.5" ry="7.5" />
    <ellipse cx="52" cy="20" rx="6" ry="8" />
    <path d="M32 28c-10 0-18 6-18 14 0 6 4 10 10 12 2 1 5 2 8 2s6-1 8-2c6-2 10-6 10-12 0-8-8-14-18-14z" />
  </svg>
);

const ShieldIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const SparkleIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z" />
    <path d="M19 15l.75 2.25L22 18l-2.25.75L19 21l-.75-2.25L16 18l2.25-.75L19 15z" opacity="0.6" />
    <path d="M5 4l.5 1.5L7 6l-1.5.5L5 8l-.5-1.5L3 6l1.5-.5L5 4z" opacity="0.4" />
  </svg>
);

const HeartIcon = ({ size = 24, filled = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const CartIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

const StarIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const TruckIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

const ZapIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const ArrowRightIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const CheckIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const GithubIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

// ─── Pet Image Component ─────────────────────────────────────────
const PetImage = ({ pet, size = 80, className = '' }) => (
  <img
    src={`/pets/${pet}.png`}
    alt={pet}
    width={size}
    height={size}
    className={`lp-pet-img ${className}`}
    style={{ objectFit: 'contain', display: 'block' }}
  />
);

// ─── Floating Particle ──────────────────────────────────────────
function FloatingParticle({ x, y, delay, duration, size }) {
  return (
    <div
      className="floating-particle"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
        width: size,
        height: size,
      }}
    />
  );
}

// ─── Counter Animation ──────────────────────────────────────────
function AnimatedCounter({ value, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = Date.now();
          const end = parseInt(value);
          const timer = setInterval(() => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * end));
            if (progress >= 1) clearInterval(timer);
          }, 16);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// ─── Landing Page ───────────────────────────────────────────────
export default function LandingPage({ onEnter }) {
  const [scrollY, setScrollY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const particles = Array.from({ length: 20 }, (_, i) => ({
    x: (i * 17 + 5) % 100,
    y: (i * 23 + 10) % 100,
    delay: (i * 0.4) % 5,
    duration: 4 + (i % 4),
    size: 2 + (i % 4),
  }));

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="landing-root">
      {/* ── Background ── */}
      <div className="landing-bg">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
        {particles.map((p, i) => <FloatingParticle key={i} {...p} />)}
        <div className="bg-grid" />
      </div>

      {/* ── Navbar ── */}
      <header className={`lp-nav ${scrollY > 50 ? 'lp-nav-scrolled' : ''}`}>
        <div className="lp-nav-inner">
          <div className="lp-nav-logo">
            <div className="lp-logo-icon"><PawIcon size={20} /></div>
            <span className="lp-logo-text">Pawfect FurEver</span>
          </div>

          <nav className={`lp-nav-links ${menuOpen ? 'open' : ''}`}>
            <a href="#features" className="lp-nav-link" onClick={() => setMenuOpen(false)}>Features</a>
            <a href="#how-it-works" className="lp-nav-link" onClick={() => setMenuOpen(false)}>How It Works</a>
            <a href="#pets" className="lp-nav-link" onClick={() => setMenuOpen(false)}>Pets</a>
            <a href="#stats" className="lp-nav-link" onClick={() => setMenuOpen(false)}>Stats</a>
          </nav>

          <div className="lp-nav-actions">
            <button className="lp-btn lp-btn-ghost" onClick={onEnter}>Sign In</button>
            <button className="lp-btn lp-btn-primary" onClick={onEnter}>
              Get Started <ArrowRightIcon size={16} />
            </button>
          </div>

          <button className="lp-menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            <span /><span /><span />
          </button>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="lp-hero">
        <div className="lp-hero-content">
          <div className="lp-hero-badge animate-fade-up">
            <SparkleIcon size={14} />
            <span>Personalized Pet Shopping Experience</span>
          </div>

          <h1 className="lp-hero-title animate-fade-up anim-delay-1">
            Shop Smarter<br />
            <span className="lp-gradient-text">for Your Pet</span>
          </h1>

          <p className="lp-hero-subtitle animate-fade-up anim-delay-2">
            Pawfect FurEver learns about your pet&apos;s breed, preferences, and needs
            to deliver curated product recommendations they&apos;ll actually love.
          </p>

          <div className="lp-hero-actions animate-fade-up anim-delay-3">
            <button className="lp-btn lp-btn-primary lp-btn-lg" onClick={onEnter}>
              Start Shopping <ArrowRightIcon size={18} />
            </button>
            <a href="#how-it-works" className="lp-btn lp-btn-outline lp-btn-lg">
              See How It Works
            </a>
          </div>

          <div className="lp-hero-trust animate-fade-up anim-delay-4">
            <div className="lp-trust-item">
              <div className="lp-trust-stars">
                {[1,2,3,4,5].map(i => <StarIcon key={i} size={14} />)}
              </div>
              <span>4.9/5 from pet owners</span>
            </div>
            <div className="lp-trust-divider" />
            <div className="lp-trust-item">
              <ShieldIcon size={16} /><span>100% Secure Shopping</span>
            </div>
            <div className="lp-trust-divider" />
            <div className="lp-trust-item">
              <TruckIcon size={16} /><span>Free shipping above $50</span>
            </div>
          </div>
        </div>

        <div className="lp-hero-visual animate-fade-right anim-delay-2">
          <div className="lp-hero-card-stack">
            {/* Main card */}
            <div className="lp-hero-card lp-hero-card-main">
              <div className="lp-hero-card-header">
                <div className="lp-hero-card-avatar">
                  <PetImage pet="dog" size={64} />
                </div>
                <div>
                  <div className="lp-hero-card-name">Max&apos;s Store</div>
                  <div className="lp-hero-card-breed">Golden Retriever</div>
                </div>
              </div>

              <div className="lp-hero-card-products">
                <div className="lp-mini-product">
                  <div className="lp-mini-product-img lp-mini-img-dog">
                    <PetImage pet="dog" size={36} />
                  </div>
                  <div>
                    <div className="lp-mini-product-name">Premium Bone Treats</div>
                    <div className="lp-mini-product-price">$14.99</div>
                  </div>
                  <div className="lp-mini-product-badge">For Dogs</div>
                </div>
                <div className="lp-mini-product">
                  <div className="lp-mini-product-img lp-mini-img-cat">
                    <PetImage pet="cat" size={36} />
                  </div>
                  <div>
                    <div className="lp-mini-product-name">Cozy Pet Bed</div>
                    <div className="lp-mini-product-price">$49.99</div>
                  </div>
                  <div className="lp-mini-product-badge recommended">Top Pick</div>
                </div>
              </div>

              <div className="lp-hero-card-footer">
                <span className="lp-rec-label">
                  <SparkleIcon size={12} /> Personalized just for Max
                </span>
              </div>
            </div>

            {/* Floating badges */}
            <div className="lp-hero-card lp-hero-card-accent lp-card-float-1">
              <CartIcon size={16} />
              <span style={{ fontSize: '0.8rem', fontWeight: 600, marginLeft: '0.4rem' }}>Added to cart!</span>
            </div>
            <div className="lp-hero-card lp-hero-card-accent lp-card-float-2">
              <div className="lp-rating-mini">
                {[1,2,3,4,5].map(i => <StarIcon key={i} size={12} />)}
                <span>4.9</span>
              </div>
            </div>
            <div className="lp-hero-card lp-hero-card-accent lp-card-float-3">
              <TruckIcon size={14} />
              <span style={{ fontSize: '0.75rem', marginLeft: '0.4rem' }}>Free delivery!</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section id="stats" className="lp-stats">
        <div className="lp-stats-inner">
          {[
            { value: '50000', label: 'Happy Pet Owners', suffix: '+' },
            { value: '1200', label: 'Premium Products', suffix: '+' },
            { value: '6', label: 'Pet Categories', suffix: '' },
            { value: '99', label: 'Satisfaction Rate', suffix: '%' },
          ].map((stat, i) => (
            <div key={i} className="lp-stat-item">
              <div className="lp-stat-value">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="lp-stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="lp-section">
        <div className="lp-section-inner">
          <div className="lp-section-header">
            <div className="lp-section-badge"><SparkleIcon size={14} /><span>Features</span></div>
            <h2 className="lp-section-title">Everything your pet <span className="lp-gradient-text">deserves</span></h2>
            <p className="lp-section-subtitle">A complete pet shopping ecosystem, built with love and powered by smart personalization</p>
          </div>

          <div className="lp-features-grid">
            {[
              { icon: <SparkleIcon size={28} />, color: '#7c3aed', title: 'Smart Personalization', description: "Tell us your pet's type and breed. We'll curate a store experience tailored just for them — from food to toys." },
              { icon: <ShieldIcon size={28} />, color: '#10b981', title: 'Secure Authentication', description: 'JWT-based auth keeps your account and order history completely safe. No compromises on security.' },
              { icon: <CartIcon size={28} />, color: '#f59e0b', title: 'Seamless Cart & Checkout', description: 'Add products, adjust quantities, and checkout in seconds. Free shipping on orders above $50.' },
              { icon: <HeartIcon size={28} filled />, color: '#ef4444', title: 'Wishlist & Favorites', description: 'Save products you love. Come back anytime and find them waiting. Never miss an item again.' },
              { icon: <TruckIcon size={28} />, color: '#3b82f6', title: 'Real-Time Order Tracking', description: 'Follow your order from confirmed to delivered. Get estimated delivery dates and live status updates.' },
              { icon: <StarIcon size={28} />, color: '#f59e0b', title: 'Ratings & Reviews', description: "Community-driven product reviews help you pick what's truly paw-approved for your companion." },
            ].map((feat, i) => (
              <div key={i} className="lp-feature-card" style={{ '--feat-color': feat.color }}>
                <div className="lp-feature-icon" style={{ background: `${feat.color}18`, color: feat.color }}>{feat.icon}</div>
                <h3 className="lp-feature-title">{feat.title}</h3>
                <p className="lp-feature-desc">{feat.description}</p>
                <div className="lp-feature-line" style={{ background: feat.color }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="lp-section lp-section-dark">
        <div className="lp-section-inner">
          <div className="lp-section-header">
            <div className="lp-section-badge"><ZapIcon size={14} /><span>Process</span></div>
            <h2 className="lp-section-title">Up and running in <span className="lp-gradient-text">3 steps</span></h2>
          </div>

          <div className="lp-steps">
            {[
              { step: '01', title: 'Create Your Account', desc: "Sign up securely in under 30 seconds. No credit card required to browse.", icon: <ShieldIcon size={32} />, color: '#7c3aed' },
              { step: '02', title: 'Set Up Your Pet Profile', desc: "Tell us your pet's type and breed. Our system personalizes your entire experience instantly.", icon: <PawIcon size={32} />, color: '#f59e0b' },
              { step: '03', title: 'Shop & Enjoy', desc: 'Browse curated products, add to cart, checkout, and track delivery — all in one place.', icon: <CartIcon size={32} />, color: '#10b981' },
            ].map((step, i) => (
              <div key={i} className="lp-step">
                <div className="lp-step-number" style={{ '--step-color': step.color }}>{step.step}</div>
                <div className="lp-step-icon" style={{ color: step.color, background: `${step.color}18` }}>{step.icon}</div>
                <h3 className="lp-step-title">{step.title}</h3>
                <p className="lp-step-desc">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="lp-steps-cta">
            <button className="lp-btn lp-btn-primary lp-btn-lg" onClick={onEnter}>
              Get Started Now <ArrowRightIcon size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* ── Pet Categories ── */}
      <section id="pets" className="lp-section">
        <div className="lp-section-inner">
          <div className="lp-section-header">
            <div className="lp-section-badge"><PawIcon size={14} /><span>All Pets</span></div>
            <h2 className="lp-section-title">For every <span className="lp-gradient-text">companion</span></h2>
            <p className="lp-section-subtitle">From playful dogs to serene fish, we have dedicated collections for every pet</p>
          </div>

          <div className="lp-pets-grid">
            {[
              { name: 'Dogs',     pet: 'dog',     count: '320+ products', color: '#7c3aed', desc: 'Treats, toys, beds & more' },
              { name: 'Cats',     pet: 'cat',     count: '280+ products', color: '#f59e0b', desc: 'Food, scratchers & accessories' },
              { name: 'Birds',    pet: 'bird',    count: '120+ products', color: '#10b981', desc: 'Cages, seeds & perches' },
              { name: 'Fish',     pet: 'fish',    count: '95+ products',  color: '#3b82f6', desc: 'Tanks, filters & décor' },
              { name: 'Rabbits',  pet: 'rabbit',  count: '80+ products',  color: '#ec4899', desc: 'Pellets, hay & housing' },
              { name: 'Hamsters', pet: 'hamster', count: '65+ products',  color: '#f97316', desc: 'Wheels, bedding & food' },
            ].map((item, i) => (
              <div key={i} className="lp-pet-card" style={{ '--pet-color': item.color }}>
                <div className="lp-pet-icon">
                  <PetImage pet={item.pet} size={100} className="lp-pet-card-img" />
                </div>
                <h3 className="lp-pet-name">{item.name}</h3>
                <p className="lp-pet-desc">{item.desc}</p>
                <div className="lp-pet-count" style={{ color: item.color }}>{item.count}</div>
                <button className="lp-pet-btn" style={{ color: item.color, borderColor: `${item.color}40` }} onClick={onEnter}>
                  Browse <ArrowRightIcon size={14} />
                </button>
                <div className="lp-pet-glow" style={{ background: item.color }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Reviews ── */}
      <section className="lp-section lp-section-dark">
        <div className="lp-section-inner">
          <div className="lp-section-header">
            <div className="lp-section-badge"><HeartIcon size={14} /><span>Testimonials</span></div>
            <h2 className="lp-section-title">Pet owners <span className="lp-gradient-text">love us</span></h2>
          </div>

          <div className="lp-reviews-grid">
            {[
              { name: 'Sarah M.', pet: 'Golden Retriever Owner', petImg: 'dog',     color: '#7c3aed', text: "Finally a pet store that actually knows what's good for a Golden! The personalized recommendations are spot-on. Max has never been happier with his treats.", rating: 5 },
              { name: 'James T.', pet: 'Persian Cat Owner',      petImg: 'cat',     color: '#f59e0b', text: "The cat-specific filter showed me products I wouldn't have found anywhere else. Luna's new cat tree is absolutely amazing. Fast delivery too!", rating: 5 },
              { name: 'Priya K.', pet: 'Rabbit Owner',           petImg: 'rabbit',  color: '#ec4899', text: 'Outstanding selection for small pets! The breed-based recommendations helped me find exactly the right hay and pellet mix for my Holland Lop.', rating: 5 },
            ].map((review, i) => (
              <div key={i} className="lp-review-card">
                <div className="lp-review-stars">
                  {Array.from({ length: review.rating }).map((_, j) => <StarIcon key={j} size={16} />)}
                </div>
                <p className="lp-review-text">&ldquo;{review.text}&rdquo;</p>
                <div className="lp-review-author">
                  <div className="lp-review-avatar" style={{ background: `${review.color}18`, border: `1px solid ${review.color}30` }}>
                    <PetImage pet={review.petImg} size={40} />
                  </div>
                  <div>
                    <div className="lp-review-name">{review.name}</div>
                    <div className="lp-review-pet">{review.pet}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tech Stack ── */}
      <section className="lp-section">
        <div className="lp-section-inner">
          <div className="lp-section-header">
            <div className="lp-section-badge"><ZapIcon size={14} /><span>Tech Stack</span></div>
            <h2 className="lp-section-title">Built with <span className="lp-gradient-text">production-grade</span> technology</h2>
            <p className="lp-section-subtitle">A complete full-stack DevOps project — containerized, automated, and deployed</p>
          </div>

          <div className="lp-tech-grid">
            {[
              { label: 'React + Vite',       category: 'Frontend',        color: '#61dafb' },
              { label: 'Node.js + Express',  category: 'Backend',         color: '#7c3aed' },
              { label: 'MongoDB',            category: 'Database',        color: '#10b981' },
              { label: 'Docker + Compose',   category: 'DevOps',          color: '#2496ed' },
              { label: 'GitHub Actions',     category: 'CI/CD',           color: '#f59e0b' },
              { label: 'JWT Auth',           category: 'Security',        color: '#ef4444' },
              { label: 'Vercel',             category: 'Frontend Deploy', color: '#a78bfa' },
              { label: 'Render',             category: 'Backend Deploy',  color: '#10b981' },
            ].map((tech, i) => (
              <div key={i} className="lp-tech-pill" style={{ '--tech-color': tech.color }}>
                <div className="lp-tech-dot" style={{ background: tech.color }} />
                <div>
                  <div className="lp-tech-name">{tech.label}</div>
                  <div className="lp-tech-cat">{tech.category}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="lp-devops-highlights">
            {[
              'Dockerized frontend, backend & MongoDB',
              'Automated build & deploy via GitHub Actions',
              'Environment-based configuration management',
              'Stateless JWT authentication architecture',
            ].map((text, i) => (
              <div key={i} className="lp-highlight-item">
                <span className="lp-highlight-icon"><CheckIcon size={16} /></span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="lp-cta">
        <div className="lp-cta-inner">
          <div className="lp-cta-glow" />
          <div className="lp-cta-content">
            {/* Three bouncing pet avatars */}
            <div className="lp-cta-pets">
              <div className="lp-cta-pet-bubble lp-cta-pet-1">
                <PetImage pet="dog" size={56} />
              </div>
              <div className="lp-cta-pet-bubble lp-cta-pet-2">
                <PetImage pet="cat" size={56} />
              </div>
              <div className="lp-cta-pet-bubble lp-cta-pet-3">
                <PetImage pet="rabbit" size={56} />
              </div>
            </div>

            <h2 className="lp-cta-title">
              Your pet&apos;s perfect store<br />is one click away
            </h2>
            <p className="lp-cta-subtitle">
              Join thousands of pet owners who&apos;ve discovered the joy of personalized pet shopping
            </p>
            <div className="lp-cta-actions">
              <button className="lp-btn lp-btn-white lp-btn-lg" onClick={onEnter}>
                Create Free Account <ArrowRightIcon size={18} />
              </button>
              <button className="lp-btn lp-btn-outline-light lp-btn-lg" onClick={onEnter}>
                Sign In
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-brand">
            <div className="lp-footer-logo">
              <div className="lp-logo-icon"><PawIcon size={18} /></div>
              <span className="lp-logo-text">Pawfect FurEver</span>
            </div>
            <p className="lp-footer-tagline">A personalized pet e-commerce platform built with Full Stack DevOps practices.</p>
            <div className="lp-footer-tags">
              <span className="lp-tag">React</span>
              <span className="lp-tag">Node.js</span>
              <span className="lp-tag">Docker</span>
              <span className="lp-tag">MongoDB</span>
            </div>
          </div>

          <div className="lp-footer-links">
            <div className="lp-footer-col">
              <div className="lp-footer-col-title">Platform</div>
              <button className="lp-footer-link" onClick={onEnter}>Shop</button>
              <button className="lp-footer-link" onClick={onEnter}>Sign In</button>
              <button className="lp-footer-link" onClick={onEnter}>Create Account</button>
            </div>
            <div className="lp-footer-col">
              <div className="lp-footer-col-title">Pets</div>
              <button className="lp-footer-link" onClick={onEnter}>Dogs</button>
              <button className="lp-footer-link" onClick={onEnter}>Cats</button>
              <button className="lp-footer-link" onClick={onEnter}>Birds</button>
              <button className="lp-footer-link" onClick={onEnter}>Fish</button>
            </div>
          </div>
        </div>

        <div className="lp-footer-bottom">
          <span>© 2025 Pawfect FurEver — Full Stack DevOps Project</span>
          <a href="https://github.com" target="_blank" rel="noreferrer" className="lp-footer-social">
            <GithubIcon size={18} />
          </a>
        </div>
      </footer>
    </div>
  );
}
