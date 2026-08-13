import confetti from 'canvas-confetti';

/**
 * Triggers a multi-stage celebration confetti burst on success actions.
 */
export const triggerSuccessConfetti = () => {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 }
  };

  function fire(particleRatio, opts) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio)
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
    colors: ['#2563eb', '#38bdf8', '#4f46e5']
  });
  fire(0.2, {
    spread: 60,
    colors: ['#10b981', '#34d399', '#059669']
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    colors: ['#f59e0b', '#ec4899', '#8b5cf6']
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
};
