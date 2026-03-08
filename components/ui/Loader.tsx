export default function Loader({
  size = "w-16 h-16",
  color = "border-blue-500",
}) {
  return (
    <div className="flex justify-center items-center h-full">
      <div
        className={`border-4 rounded-full animate-spin border-t-transparent ${color} ${size}`}
      />
    </div>
  );
}
