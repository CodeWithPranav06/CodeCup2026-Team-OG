import React, { useEffect, useRef, useState } from 'react';

interface RevealLayerProps {
  cursorX: number;
  cursorY: number;
}

const SPOTLIGHT_R = 260;

// BG_2: Clean teal/cyan structured grid pattern on dark navy
const BG_2_STYLE: React.CSSProperties = {
  backgroundColor: '#0a0e1a',
  backgroundImage: [
    'repeating-linear-gradient(0deg, transparent, transparent 59px, rgba(42,201,160,0.08) 59px, rgba(42,201,160,0.08) 60px)',
    'repeating-linear-gradient(90deg, transparent, transparent 59px, rgba(42,201,160,0.08) 59px, rgba(42,201,160,0.08) 60px)',
    'repeating-linear-gradient(0deg, transparent, transparent 299px, rgba(42,201,160,0.15) 299px, rgba(42,201,160,0.15) 300px)',
    'repeating-linear-gradient(90deg, transparent, transparent 299px, rgba(42,201,160,0.15) 299px, rgba(42,201,160,0.15) 300px)',
    'radial-gradient(circle at 30% 20%, rgba(42,201,160,0.06) 0%, transparent 50%)',
    'radial-gradient(circle at 70% 80%, rgba(0,200,200,0.04) 0%, transparent 40%)',
  ].join(', '),
};

export const RevealLayer: React.FC<RevealLayerProps> = ({ cursorX, cursorY }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const revealDivRef = useRef<HTMLDivElement>(null);

  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1920,
    height: typeof window !== 'undefined' ? window.innerHeight : 1080,
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const revealDiv = revealDivRef.current;
    if (!canvas || !revealDiv) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    const gradient = ctx.createRadialGradient(
      cursorX, cursorY, 0,
      cursorX, cursorY, SPOTLIGHT_R
    );

    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.4, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.75)');
    gradient.addColorStop(0.75, 'rgba(255, 255, 255, 0.4)');
    gradient.addColorStop(0.88, 'rgba(255, 255, 255, 0.12)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cursorX, cursorY, SPOTLIGHT_R, 0, Math.PI * 2);
    ctx.fill();

    try {
      const dataUrl = canvas.toDataURL();
      revealDiv.style.maskImage = `url(${dataUrl})`;
      revealDiv.style.webkitMaskImage = `url(${dataUrl})`;
      revealDiv.style.maskSize = '100% 100%';
      revealDiv.style.webkitMaskSize = '100% 100%';
      revealDiv.style.maskRepeat = 'no-repeat';
      revealDiv.style.webkitMaskRepeat = 'no-repeat';
    } catch (e) {
      console.error('Error generating canvas mask URL:', e);
    }
  }, [cursorX, cursorY, dimensions]);

  return (
    <>
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="absolute inset-0 pointer-events-none"
        style={{ display: 'none' }}
      />
      <div
        ref={revealDivRef}
        className="absolute inset-0 z-30 pointer-events-none"
        style={BG_2_STYLE}
      />
    </>
  );
};

export default RevealLayer;
