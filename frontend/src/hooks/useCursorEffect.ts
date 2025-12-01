/**
 * Custom hook for spooky cursor click effects
 * Creates ripple and sparkle animations on click
 */

import { useEffect } from 'react';

export function useCursorEffect() {
  useEffect(() => {
    const body = document.body;
    const isHalloween = body.getAttribute('data-halloween-theme') === 'true';

    if (!isHalloween) return;

    const sparkles = ['✨', '🎃', '👻', '💀', '🕷️'];
    let lastSparkleTime = 0;

    const handleMouseClick = (e: MouseEvent) => {
      const { clientX, clientY } = e;

      // Create ripple effect
      const ripple = document.createElement('div');
      ripple.className = 'cursor-click-effect';
      ripple.style.left = clientX - 50 + 'px';
      ripple.style.top = clientY - 50 + 'px';
      document.body.appendChild(ripple);

      // Remove ripple after animation
      setTimeout(() => ripple.remove(), 600);

      // Create sparkles occasionally (throttled)
      const now = Date.now();
      if (now - lastSparkleTime > 100) {
        const sparkleCount = Math.random() > 0.5 ? 2 : 3;
        for (let i = 0; i < sparkleCount; i++) {
          const sparkle = document.createElement('div');
          sparkle.className = 'cursor-sparkle';
          sparkle.textContent = sparkles[Math.floor(Math.random() * sparkles.length)];

          const angle = (i / sparkleCount) * Math.PI * 2;
          const distance = 40 + Math.random() * 20;
          const tx = Math.cos(angle) * distance;
          const ty = Math.sin(angle) * distance;

          sparkle.style.left = clientX + 'px';
          sparkle.style.top = clientY + 'px';
          sparkle.style.setProperty('--tx', `${tx}px`);
          sparkle.style.setProperty('--ty', `${ty}px`);

          document.body.appendChild(sparkle);

          // Remove sparkle after animation
          setTimeout(() => sparkle.remove(), 800);
        }
        lastSparkleTime = now;
      }
    };

    document.addEventListener('click', handleMouseClick);

    return () => {
      document.removeEventListener('click', handleMouseClick);
    };
  }, []);
}
