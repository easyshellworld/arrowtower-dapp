"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export function PageTransition({ children, className = "" }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, filter: "blur(5px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -10, filter: "blur(5px)" }}
      transition={{ 
        duration: 0.4, 
        ease: [0.22, 1, 0.36, 1] // Custom cubic bezier for smooth feeling
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

