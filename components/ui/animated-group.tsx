"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export function AnimatedGroup({
  children,
  className,
  role,
  id,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
}: {
  children: React.ReactNode;
  className?: string;
  role?: string;
  id?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : "hidden"}
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: reduceMotion ? 0 : 0.08,
          },
        },
      }}
      className={cn(className)}
      role={role}
      id={id}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
    >
      {Array.isArray(children)
        ? children.map((child, index) => (
            <motion.div
              key={index}
              variants={{
                hidden: { opacity: 0, y: reduceMotion ? 0 : 16 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={reduceMotion ? { duration: 0 } : { duration: 0.28, ease: "easeOut" }}
            >
              {child}
            </motion.div>
          ))
        : (
          <motion.div
            variants={{
              hidden: { opacity: 0, y: reduceMotion ? 0 : 16 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.28, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        )}
    </motion.div>
  );
}
