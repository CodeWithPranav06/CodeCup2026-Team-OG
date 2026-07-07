import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import DomainScanner from './components/DomainScanner';

function App() {
  return (
    <div
      className="min-h-screen bg-white tracking-[-0.02em]"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <Navbar />
      <HeroSection />
      <DomainScanner />
    </div>
  );
}

export default App;
