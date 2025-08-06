import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

export default function CopyAnimatedToast({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ x: 100, opacity: 0, scale: 0.95 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          exit={{ x: 100, opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="fixed top-1/2 right-0 z-50 transform -translate-y-1/2 bg-pink-400 text-white rounded-l-xl shadow-lg flex items-center px-5 py-3 gap-3"
          style={{
            minWidth: "220px",
            maxWidth: "80vw",
          }}
        >
          <Check className="w-6 h-6" />
          <span className="font-semibold whitespace-nowrap">¡Enlace copiado!</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}