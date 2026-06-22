import { useEffect } from "react";
export default function Toast({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 2000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#2a2a2a] border border-[#444] text-white text-sm px-4 py-2 rounded-lg z-[60] animate-fade-in">
      {message}
    </div>
  );
}