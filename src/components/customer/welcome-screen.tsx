"use client";

import { motion } from "framer-motion";

type Props = {
  restaurantName: string;
  tableName: string;
  onStart: () => void;
};

export function WelcomeScreen({ restaurantName, tableName, onStart }: Props) {
  return (
    <motion.div
      key="welcome"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex min-h-[70vh] flex-col justify-center px-6 py-12"
    >
      <p className="text-sm font-medium uppercase tracking-wider text-brand-600">
        Welcome
      </p>
      <h1 className="mt-3 font-display text-4xl leading-tight text-stone-900">
        {restaurantName}
      </h1>
      <p className="mt-4 text-lg text-stone-600">
        You&apos;re at <span className="font-medium text-stone-800">{tableName}</span>.
        I&apos;ll walk you through your order — one step at a time.
      </p>
      <button
        type="button"
        onClick={onStart}
        className="touch-target mt-10 w-full rounded-2xl bg-brand-500 py-4 text-lg font-medium text-white shadow-xl shadow-brand-500/30 active:scale-[0.98]"
      >
        Let&apos;s get started
      </button>
    </motion.div>
  );
}
