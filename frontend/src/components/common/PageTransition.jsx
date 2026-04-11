import { motion } from "framer-motion";

export default function PageTransition({ routeKey, children, className = "" }) {
  return (
    <motion.div
      key={routeKey}
      initial={{ scale: 0.985, y: 4 }}
      animate={{ scale: 1, y: 0 }}
      transition={{
        duration: 0.2,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}