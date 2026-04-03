"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  asChild = false,
  children,
  ...props
}: ButtonProps) {
  const reduceMotion = useReducedMotion();
  const classNames = cn(
    "inline-flex items-center justify-center gap-2 rounded-2xl font-medium transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring)] disabled:pointer-events-none disabled:opacity-60",
    variant === "primary" && "bg-[var(--accent)] text-white hover:bg-[var(--accent-strong)]",
    variant === "secondary" && "bg-white/10 text-[var(--foreground)] hover:bg-white/16",
    variant === "ghost" && "text-[var(--muted)] hover:bg-white/8 hover:text-[var(--foreground)]",
    size === "sm" && "h-10 px-4 text-sm",
    size === "md" && "h-11 px-5 text-sm",
    size === "lg" && "h-12 px-6 text-base",
    className,
  );

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{ className?: string }>;

    return (
      <motion.span
        whileHover={reduceMotion ? undefined : { y: -1, scale: 1.01 }}
        whileTap={reduceMotion ? undefined : { scale: 0.99 }}
        className="inline-flex"
      >
        {React.cloneElement(child, {
          className: cn(classNames, child.props.className),
        })}
      </motion.span>
    );
  }

  return (
    <motion.span
      whileHover={reduceMotion ? undefined : { y: -1, scale: 1.01 }}
      whileTap={reduceMotion ? undefined : { scale: 0.99 }}
      className="inline-flex"
    >
      <button className={classNames} {...props}>
        {children}
      </button>
    </motion.span>
  );
}
