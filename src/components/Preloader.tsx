import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';

export const Preloader: React.FC = () => {
  const [shouldRender, setShouldRender] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Stage 1: Trigger CSS fade out transition after 1.8 seconds
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 1800);

    // Stage 2: Completely unmount the component from DOM after 2.6 seconds (when transition finishes)
    const removeTimer = setTimeout(() => {
      setShouldRender(false);
    }, 2600);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!shouldRender) return null;

  return (
    <div className={`preloader ${isFadingOut ? 'fade-out' : ''}`}>
      <div className="preloader-content">
        <div className="preloader-logo">
          <Heart size={64} fill="currentColor" stroke="currentColor" />
        </div>
        <div className="preloader-info">
          <h1 className="preloader-title">FluffyyyBloomss</h1>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div className="preloader-bar" />
          </div>
          <p className="preloader-subtitle" style={{ marginTop: '1rem' }}>Handcrafted Wonders</p>
        </div>
      </div>
    </div>
  );
};
export default Preloader;
