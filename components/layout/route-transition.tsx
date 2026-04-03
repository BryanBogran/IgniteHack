"use client";

import { motion, useReducedMotion } from "motion/react";

export function RouteTransition({ children }: { children: React.ReactNode }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.2, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
