import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipProps {
  children: React.ReactNode;
  content: string | React.ReactNode;
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({ children, content, className }) => {
  const [isHovered, setIsHovered] = useState(false);

  if (!content) {
    return <>{children}</>;
  }

  return (
    <div
      className="relative flex items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={`absolute z-50 p-2 text-xs font-medium text-gray-200 bg-gray-900 border border-white/10 rounded-md shadow-lg max-w-xs bottom-full mb-2 left-1/2 -translate-x-1/2 ${className}`}
            role="tooltip"
          >
            {content}
            <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tooltip;
