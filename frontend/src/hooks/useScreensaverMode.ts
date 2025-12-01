/**
 * Custom hook for inactivity screensaver mode
 * Triggers melting UI effect after 10 seconds of inactivity
 * Includes flying icons, UI melting, and blood drip effects
 */

import { useEffect, useRef } from 'react';

interface ScreensaverState {
  isActive: boolean;
  inactivityTimer: ReturnType<typeof setTimeout> | null;
}

const INACTIVITY_TIMEOUT = 30000; // 30 seconds

export function useScreensaverMode() {
  const stateRef = useRef<ScreensaverState>({
    isActive: false,
    inactivityTimer: null,
  });

  useEffect(() => {
    const body = document.body;
    const isHalloween = body.getAttribute('data-halloween-theme') === 'true';

    if (!isHalloween) return;

    // Create screensaver container
    const screensaver = document.createElement('div');
    screensaver.id = 'halloween-screensaver';
    screensaver.className = 'halloween-screensaver';
    document.body.appendChild(screensaver);

    // Start flying icons
    startFlyingIcons(screensaver);

    const activateScreensaverLocal = () => {
      stateRef.current.isActive = true;
      screensaver.classList.add('active');
      createMeltEffect();
      playScreamsaverSound();
    };

    const resetInactivityTimer = () => {
      // Clear existing timer
      if (stateRef.current.inactivityTimer) {
        clearTimeout(stateRef.current.inactivityTimer);
      }

      // Remove screensaver if active
      if (stateRef.current.isActive) {
        screensaver.classList.remove('active');
        stateRef.current.isActive = false;
        removeMeltEffect();
      }

      // Set new timer
      stateRef.current.inactivityTimer = setTimeout(() => {
        activateScreensaverLocal();
      }, INACTIVITY_TIMEOUT);
    };

    // Trigger on user activity
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, resetInactivityTimer, true);
    });

    // Initial setup
    resetInactivityTimer();

    return () => {
      // Cleanup
      events.forEach(event => {
        document.removeEventListener(event, resetInactivityTimer, true);
      });

      if (stateRef.current.inactivityTimer) {
        clearTimeout(stateRef.current.inactivityTimer);
      }

      if (screensaver.parentNode) {
        screensaver.remove();
      }
    };
  }, []);
}

function startFlyingIcons(container: HTMLElement) {
  const icons = ['🎃', '👻', '💀', '🕷️', '✨', '🩸'];
  const flyingIconsContainer = document.createElement('div');
  flyingIconsContainer.className = 'flying-icons-container';
  container.appendChild(flyingIconsContainer);

  // Create multiple flying icons
  for (let i = 0; i < 8; i++) {
    const icon = document.createElement('div');
    icon.className = 'flying-icon';
    icon.textContent = icons[Math.floor(Math.random() * icons.length)];

    // Random starting position
    const startX = Math.random() * window.innerWidth;
    const startY = Math.random() * window.innerHeight;

    icon.style.left = startX + 'px';
    icon.style.top = startY + 'px';

    // Delay for staggered animation
    const delay = i * 0.2;
    icon.style.animationDelay = delay + 's';

    flyingIconsContainer.appendChild(icon);
  }
}

function createMeltEffect() {
  const meltOverlay = document.createElement('div');
  meltOverlay.id = 'ui-melt-effect';
  meltOverlay.className = 'ui-melt-effect';

  // Create multiple blood drips
  for (let i = 0; i < 15; i++) {
    const drip = document.createElement('div');
    drip.className = 'blood-drip';
    const randomX = Math.random() * 100;
    const delay = Math.random() * 2;

    drip.style.left = randomX + '%';
    drip.style.animationDelay = delay + 's';

    meltOverlay.appendChild(drip);
  }

  // Create distortion wave effect
  for (let i = 0; i < 5; i++) {
    const wave = document.createElement('div');
    wave.className = 'melt-wave';
    const delay = i * 0.3;

    wave.style.animationDelay = delay + 's';
    meltOverlay.appendChild(wave);
  }

  document.body.appendChild(meltOverlay);
}

function removeMeltEffect() {
  const meltOverlay = document.getElementById('ui-melt-effect');
  if (meltOverlay) {
    meltOverlay.remove();
  }
}

function playScreamsaverSound() {
  try {
    // Create audio context for sound effects
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    // Spooky noise (creepy tone)
    const creepyTone = audioContext.createOscillator();
    const creepyGain = audioContext.createGain();

    creepyTone.frequency.setValueAtTime(150, audioContext.currentTime);
    creepyTone.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.5);

    creepyGain.gain.setValueAtTime(0.3, audioContext.currentTime);
    creepyGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    creepyTone.connect(creepyGain);
    creepyGain.connect(audioContext.destination);

    creepyTone.start(audioContext.currentTime);
    creepyTone.stop(audioContext.currentTime + 0.5);
  } catch (error) {
    // Audio context not available, silently fail
    console.debug('Audio context not available');
  }
}
