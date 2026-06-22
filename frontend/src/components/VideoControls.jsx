import { formatTime } from "../utils/helpers";
export const VideoControls = ({ isPlaying, onTogglePlay, onSkipBack, onSkipForward, speed, setSpeed, time, setTime, total }) => {
  const speeds = [0.25, 0.5, 1, 2];

  return (
    <div className="flex flex-wrap items-center gap-2 px-3 py-2 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a]">
      <button onClick={onSkipBack} className="w-7 h-7 rounded-full bg-transparent border border-[#3a3a3a] text-[#999] flex items-center justify-center hover:border-[#666] hover:text-white transition-colors" title="−5 сек">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="19,20 9,12 19,4"/><line x1="5" y1="4" x2="5" y2="20"/></svg>
      </button>
      <button onClick={onTogglePlay} className="w-9 h-9 rounded-full bg-[#f59e0b] text-black flex items-center justify-center hover:scale-105 transition-transform">
        {isPlaying ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="3" width="4" height="18"/><rect x="15" y="3" width="4" height="18"/></svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="6,3 20,12 6,21"/></svg>
        )}
      </button>
      <button onClick={onSkipForward} className="w-7 h-7 rounded-full bg-transparent border border-[#3a3a3a] text-[#999] flex items-center justify-center hover:border-[#666] hover:text-white transition-colors" title="+5 сек">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5,4 15,12 5,20"/><line x1="19" y1="4" x2="19" y2="20"/></svg>
      </button>
      <div className="w-px h-5 bg-[#3a3a3a]"></div>
      {speeds.map(s => (
        <button
          key={s}
          onClick={() => setSpeed(s)}
          className={`px-2 py-0.5 rounded text-[11px] font-mono border transition-colors ${
            speed === s ? 'bg-[#f59e0b] text-black border-[#f59e0b] font-bold' : 'bg-[#1a1a1a] text-[#999] border-[#3a3a3a] hover:text-white'
          }`}
        >
          {s}×
        </button>
      ))}
      <div className="w-px h-5 bg-[#3a3a3a]"></div>
      <input
        type="range"
        className="flex-1 min-w-[100px] h-1 bg-[#333] rounded appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#f59e0b]"
        min="0"
        max={total}
        value={time}
        step="0.1"
        onChange={(e) => setTime(parseFloat(e.target.value))}
      />
      <span className="text-xs font-mono text-[#999] whitespace-nowrap">
        {formatTime(time)} / {formatTime(total)}
      </span>
    </div>
  );
};