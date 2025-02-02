import { motion } from "framer-motion";

export default function Loader({
  size = "w-10 h-10",
  color = "border-indigo-500",
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
