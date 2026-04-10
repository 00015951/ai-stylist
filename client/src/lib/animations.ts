/**
 * Reusable Framer Motion variants for premium fashion AI aesthetic
 * Optimized: reduced motion on mobile when prefers-reduced-motion
 */

export const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export const slideUpInView = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.35, ease: "easeInOut" },
};

export const pageTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
};

export const floatAnimation = {
  animate: {
    y: [0, -8, 0],
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
  },
};

export const shimmerAnimation = {
  initial: { backgroundPosition: "200% 0" },
  animate: {
    backgroundPosition: "-200% 0",
    transition: { duration: 2.5, repeat: Infinity, repeatDelay: 1 },
  },
};

export const springTransition = { type: "spring", stiffness: 400, damping: 30 };
export const smoothTransition = { duration: 0.3, ease: [0.22, 1, 0.36, 1] };
export const slowTransition = { duration: 0.6, ease: [0.22, 1, 0.36, 1] };

/** Step transition: slide in from right when advancing */
export const stepTransition = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
  transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
};

/** Card selection: scale + glow on select */
export const cardSelectTransition = {
  type: "spring" as const,
  stiffness: 400,
  damping: 25,
};

/** Float animation for welcome hero */
export const subtleFloat = {
  animate: {
    y: [0, -6, 0],
    transition: { duration: 5, repeat: Infinity, ease: "easeInOut" },
  },
};
