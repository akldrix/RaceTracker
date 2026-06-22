export const LiveCamera = ({active, onClick}) => {
    return (
        <div
            onClick={onClick}
            className={`relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 ${
                active
                    ? 'flex-2 border-2 border-[#f59e0b] shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                    : 'flex-1 border border-[#333] hover:border-[#555] opacity-60 hover:opacity-100'
            }`}
        >
            <div
                className="absolute top-3 left-3 flex items-center gap-2 z-10 bg-black/60 px-2 py-1 rounded backdrop-blur-sm">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                <span className="text-xs font-bold tracking-wider text-red-500">LIVE AI FEED</span>
            </div>


            <img
                src="http://localhost:8000/video_feed"
                alt="Live Race Feed"
                className="w-full h-full object-cover"
            />

            {!active && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <span className="text-white/70 font-mono text-sm uppercase tracking-widest bg-black/60 px-4 py-2 rounded">
            Кликните для просмотра
          </span>
                </div>
            )}
        </div>
    );
};