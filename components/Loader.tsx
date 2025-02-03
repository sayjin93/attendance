import { motion } from "framer-motion";

export default function Loader({
  size = "w-16 h-16",
  color = "border-blue-500",
}) {
  return (
    <div className="flex justify-center items-center h-full">
      <motion.div
        className={`border-4 rounded-full animate-spin border-t-transparent ${color} ${size}`}
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}
