import { useState } from 'react';
import { Shield, Menu, X } from 'lucide-react';

const NAV_ITEMS = ['Home', 'How It Works', 'Live Scanner', 'Team'];

const Navbar = () => {
  const [activeNav, setActiveNav] = useState('Home');
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between p-4 sm:p-5">
      {/* Left: Shield Icon + Wordmark */}
      <div className="flex items-center gap-2.5">
        <Shield size={26} className="text-white" />
        <span className="text-white text-2xl font-playfair italic">Threat Shield</span>
      </div>

      {/* Center: Desktop Nav Pill */}
      <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-2 py-2 items-center gap-1">
        {NAV_ITEMS.map((item) => (
          <button
            key={item}
            onClick={() => setActiveNav(item)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeNav === item
                ? 'bg-white text-gray-900'
                : 'text-white/80 hover:bg-white/20 hover:text-white'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {/* Right: Desktop - View on GitHub */}
      <a
        href="https://github.com"
        target="_blank"
        rel="noopener noreferrer"
        className="hidden md:block bg-white text-gray-900 text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-gray-100 transition-colors"
      >
        View on GitHub
      </a>

      {/* Right: Mobile Hamburger */}
      <button
        className="md:hidden text-white"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu Dropdown */}
      {mobileOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-white/10 p-5 flex flex-col gap-2">
          {NAV_ITEMS.map((item) => (
            <button
              key={item}
              onClick={() => {
                setActiveNav(item);
                setMobileOpen(false);
              }}
              className={`px-4 py-3 rounded-xl text-sm font-medium text-left transition-colors ${
                activeNav === item
                  ? 'bg-white/20 text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              {item}
            </button>
          ))}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 bg-white text-gray-900 text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-gray-100 transition-colors w-full text-center"
          >
            View on GitHub
          </a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
