import { useRef, useState, useEffect, useCallback } from 'react';
import RevealLayer from './RevealLayer';

const SPOTLIGHT_R = 260;
void SPOTLIGHT_R; // exported for reference; RevealLayer uses its own constant

// BG_1: Chaotic red/orange threat graph pattern on dark navy
const BG_1_STYLE: React.CSSProperties = {
  backgroundColor: '#0a0e1a',
  backgroundImage: [
    // Scattered red/orange "node" dots
    'radial-gradient(circle at 15% 25%, rgba(220,60,40,0.18) 0%, transparent 3%)',
    'radial-gradient(circle at 82% 18%, rgba(255,120,40,0.15) 0%, transparent 2.5%)',
    'radial-gradient(circle at 45% 72%, rgba(220,60,40,0.12) 0%, transparent 3.5%)',
    'radial-gradient(circle at 70% 55%, rgba(255,80,40,0.16) 0%, transparent 2%)',
    'radial-gradient(circle at 28% 88%, rgba(255,120,40,0.14) 0%, transparent 3%)',
    'radial-gradient(circle at 92% 78%, rgba(220,40,40,0.13) 0%, transparent 2.8%)',
    'radial-gradient(circle at 55% 35%, rgba(255,100,40,0.1) 0%, transparent 4%)',
    'radial-gradient(circle at 8% 60%, rgba(200,50,30,0.12) 0%, transparent 2%)',
    'radial-gradient(circle at 38% 12%, rgba(255,90,30,0.11) 0%, transparent 3.2%)',
    'radial-gradient(circle at 65% 92%, rgba(220,70,50,0.14) 0%, transparent 2.5%)',
    // "Connection lines" between nodes — diagonal thin gradients
    'linear-gradient(32deg, transparent 48%, rgba(220,60,40,0.06) 49%, rgba(220,60,40,0.06) 50%, transparent 51%)',
    'linear-gradient(145deg, transparent 46%, rgba(255,100,40,0.05) 47%, rgba(255,100,40,0.05) 48%, transparent 49%)',
    'linear-gradient(78deg, transparent 44%, rgba(200,50,30,0.04) 45%, rgba(200,50,30,0.04) 46%, transparent 47%)',
    'linear-gradient(210deg, transparent 52%, rgba(255,80,40,0.05) 53%, rgba(255,80,40,0.05) 54%, transparent 55%)',
    // Large ambient glow spots
    'radial-gradient(ellipse at 20% 50%, rgba(220,60,40,0.06) 0%, transparent 45%)',
    'radial-gradient(ellipse at 80% 30%, rgba(255,100,40,0.05) 0%, transparent 40%)',
    'radial-gradient(ellipse at 50% 90%, rgba(200,40,30,0.04) 0%, transparent 50%)',
  ].join(', '),
};

const HeroSection = () => {
  const mouse = useRef({ x: -999, y: -999 });
  const smooth = useRef({ x: -999, y: -999 });
  const rafRef = useRef<number>(0);
  const [cursorPos, setCursorPos] = useState({ x: -999, y: -999 });

  const animate = useCallback(() => {
    smooth.current.x += (mouse.current.x - smooth.current.x) * 0.1;
    smooth.current.y += (mouse.current.y - smooth.current.y) * 0.1;
    setCursorPos({ x: smooth.current.x, y: smooth.current.y });
    rafRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, [animate]);

  const scrollToScanner = () => {
    const el = document.getElementById('scanner');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      className="relative w-full overflow-hidden h-screen bg-black"
      style={{ height: '100dvh' }}
    >
      {/* Layer 1: Base Layer - chaotic threat graph */}
      <div
        className="absolute inset-0 z-10"
        style={BG_1_STYLE}
      />

      {/* Layer 2: Reveal Layer - clean structured grid */}
      <RevealLayer
        cursorX={cursorPos.x}
        cursorY={cursorPos.y}
      />

      {/* Layer 3: Heading */}
      <div className="absolute top-[14%] left-0 right-0 flex flex-col items-center text-center px-5 pointer-events-none z-50">
        <h1 className="text-white leading-[0.95]">
          <span
            className="block font-playfair italic font-normal text-5xl sm:text-7xl md:text-8xl hero-anim hero-reveal"
            style={{ letterSpacing: '-0.05em', animationDelay: '0.25s' }}
          >
            Every World Cup
          </span>
          <span
            className="block font-normal text-5xl sm:text-7xl md:text-8xl -mt-1 hero-anim hero-reveal"
            style={{ letterSpacing: '-0.08em', animationDelay: '0.42s' }}
          >
            draws its scammers.
          </span>
        </h1>
      </div>

      {/* Layer 4: Bottom-left paragraph */}
      <div
        className="hidden sm:block absolute bottom-14 left-10 md:left-14 max-w-[260px] z-50 hero-anim hero-fade"
        style={{ animationDelay: '0.7s' }}
      >
        <p className="text-sm text-white/80 leading-relaxed">
          Fake ticketing portals, cloned pages, phishing campaigns — they're built to look
          exactly like the real thing, until you know what to check.
        </p>
      </div>

      {/* Layer 5: Bottom-right block */}
      <div
        className="absolute bottom-10 sm:bottom-24 left-5 right-5 sm:left-auto sm:right-10 md:right-14 max-w-full sm:max-w-[260px] flex flex-col items-start gap-4 sm:gap-5 z-50 hero-anim hero-fade"
        style={{ animationDelay: '0.85s' }}
      >
        <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
          We fuse domain age, SSL validity, visual cloning, and OSINT signals into one risk score,
          so fans and analysts know before they click.
        </p>
        <button
          onClick={scrollToScanner}
          className="bg-[#2ac9a0] hover:bg-[#22b18c] text-white text-sm font-medium px-7 py-3 rounded-full transition-all hover:scale-[1.03] active:scale-95 hover:shadow-lg hover:shadow-[#2ac9a0]/30"
        >
          Launch Scanner
        </button>
      </div>
    </section>
  );
};

export default HeroSection;
