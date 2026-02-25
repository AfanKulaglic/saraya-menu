"use client";

import { Minus, Plus } from "lucide-react";
import { motion } from "framer-motion";

interface QuantitySelectorProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  size?: "sm" | "md";
}

export default function QuantitySelector({
  quantity,
  onIncrease,
  onDecrease,
  size = "md",
}: QuantitySelectorProps) {
  const btnSize = size === "sm" ? "w-7 h-7" : "w-9 h-9";
  const textSize = size === "sm" ? "text-sm w-6" : "text-base w-8";

  return (
    <div className="flex items-center gap-1">
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={onDecrease}
        className={`${btnSize} rounded-full bg-bg flex items-center justify-center text-dark hover:bg-gray-200 transition`}
      >
        <Minus size={size === "sm" ? 14 : 16} />
      </motion.button>
      <span className={`${textSize} text-center font-semibold`}>{quantity}</span>
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={onIncrease}
        className={`${btnSize} rounded-full bg-primary flex items-center justify-center text-white hover:bg-yellow-500 transition`}
      >
        <Plus size={size === "sm" ? 14 : 16} />
      </motion.button>
    </div>
  );
}
