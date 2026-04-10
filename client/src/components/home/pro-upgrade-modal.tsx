"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Check, Flame } from "lucide-react";
import { unlockPro } from "@/lib/paywall";

type Props = {
  open: boolean;
  onClose: () => void;
  onUnlock?: () => void;
};

/**
 * High-conversion paywall modal – dark modern UI, lock animation, gradient PRO CTA.
 */
export function ProUpgradeModal({ open, onClose, onUnlock }: Props) {
  const [lockAnimating, setLockAnimating] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    if (open) setLockAnimating(true);
  }, [open]);

  const handleUnlock = async () => {
    setPaymentLoading(true);
    try {
      await simulatePayment();
      unlockPro();
      onUnlock?.();
      onClose();
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: "spring", damping: 24, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-700/80 shadow-2xl"
          >
            {/* Lock icon + header */}
            <div className="flex flex-col items-center pt-8 pb-4 px-6">
              <motion.div
                animate={lockAnimating ? { scale: [1, 1.2, 1], rotate: [0, -5, 5, 0] } : {}}
                transition={{ duration: 0.6, ease: "easeOut" }}
                onAnimationComplete={() => setLockAnimating(false)}
                className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/30 mb-4"
              >
                <Lock className="h-8 w-8 text-amber-400" strokeWidth={2} />
              </motion.div>
              <h2 className="text-xl font-bold text-white">Unlock PRO</h2>
              <p className="text-sm text-zinc-400 text-center mt-1.5 leading-relaxed">
                Your free look is ready. Continue creating unlimited looks.
              </p>
            </div>

            {/* Benefits */}
            <div className="px-6 py-4 space-y-3">
              {[
                "Unlimited Final Looks",
                "Faster generation",
                "Higher quality results",
              ].map((benefit, i) => (
                <div
                  key={benefit}
                  className="flex items-center gap-3 text-zinc-300"
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
                    <Check className="h-3.5 w-3.5 text-emerald-400" strokeWidth={2.5} />
                  </div>
                  <span className="text-sm font-medium">{benefit}</span>
                </div>
              ))}
            </div>

            {/* Price */}
            <div className="px-6 py-2">
              <p className="text-center text-lg font-semibold text-white">
                $4.99 – Lifetime Access
              </p>
            </div>

            {/* Buttons */}
            <div className="px-6 pb-6 pt-2 space-y-3">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleUnlock}
                disabled={paymentLoading}
                className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 font-semibold text-white shadow-lg transition-all disabled:opacity-70 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-[length:200%_100%] hover:bg-[position:100%_0] bg-[position:0_0] duration-500"
              >
                <Flame className="h-5 w-5" />
                {paymentLoading ? "Processing…" : "Unlock PRO"}
              </motion.button>
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-xl py-2.5 text-sm font-medium text-zinc-400 hover:text-zinc-300 transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Fake payment simulation – replace with Stripe / Telegram Payments in production.
 */
async function simulatePayment(): Promise<void> {
  await new Promise((r) => setTimeout(r, 800));
}
