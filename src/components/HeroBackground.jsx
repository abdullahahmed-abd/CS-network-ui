import Backgroundimage from '../assets/image/Backroundimg13.png';

export default function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* BASE GRADIENT */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(145deg, #e8f5e0 0%, #f0fae8 20%, #ffffff 45%, #e8f4fd 70%, #f0fae8 100%)',
        }}
      />

      {/* BACKGROUND IMAGE */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url(${Backgroundimage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          mixBlendMode: 'multiply',
        }}
      />

      {/* SUBTLE DOT GRID */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(162,203,139,0.04) 1px, transparent 0)',
          backgroundSize: '48px 48px',
        }}
      />
    </div>
  );
}