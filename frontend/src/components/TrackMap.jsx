import { ZOOM_LEVELS } from "../constants";
import { getWheelsWord } from "../utils/helpers";
export const TrackMap = ({ track, zoomIdx, onZoomIn, onZoomOut, focus, penalties }) => {
  const scale = ZOOM_LEVELS[zoomIdx];
  const c12 = penalties.filter(p => p.car === 12).length;
  const c44 = penalties.filter(p => p.car === 44).length;

  return (
    <div className="p-4 border-b border-[#2a2a2a]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] tracking-wider text-[#777] uppercase font-semibold">СХЕМА ТРАССЫ</span>
        <span className="text-[11px] font-mono text-[#777]">{track}</span>
      </div>
      <div className="relative flex justify-center items-center" style={{ height: '170px' }}>
        <svg
          width="320"
          height="170"
          viewBox="0 0 280 160"
          style={{ transform: `scale(${scale})`, transformOrigin: 'center center', transition: 'transform 0.3s ease' }}
        >
          <path d="M40,80 C40,30 80,20 120,25 C160,30 180,20 200,30 C230,45 250,50 260,70 C270,90 250,110 220,120 C190,130 170,140 140,135 C110,130 90,140 70,130 C50,120 35,110 40,80 Z" fill="none" stroke="#222" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M40,80 C40,30 80,20 120,25 C160,30 180,20 200,30 C230,45 250,50 260,70 C270,90 250,110 220,120 C190,130 170,140 140,135 C110,130 90,140 70,130 C50,120 35,110 40,80 Z" fill="none" stroke="#444" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
          {(focus === 'all' || focus === '12') && <circle cx="120" cy="25" r="6" fill="#f59e0b" stroke="#000" strokeWidth="1.5"/>}
          {(focus === 'all' || focus === '44') && <circle cx="200" cy="30" r="6" fill="#22c55e" stroke="#000" strokeWidth="1.5"/>}
        </svg>
        <div className="absolute bottom-1 right-1 flex gap-1 z-10">
          <button
            onClick={onZoomOut}
            disabled={zoomIdx === 0}
            className="w-6 h-6 rounded-full bg-[#2a2a2a] border border-[#444] text-[#bbb] flex items-center justify-center hover:bg-[#3a3a3a] hover:text-white disabled:opacity-30 transition-colors text-sm font-bold"
          >−</button>
          <button
            onClick={onZoomIn}
            disabled={zoomIdx === ZOOM_LEVELS.length - 1}
            className="w-6 h-6 rounded-full bg-[#2a2a2a] border border-[#444] text-[#bbb] flex items-center justify-center hover:bg-[#3a3a3a] hover:text-white disabled:opacity-30 transition-colors text-sm font-bold"
          >+</button>
        </div>
      </div>
      <div className="flex items-center justify-between p-2 bg-[#1a1a1a] border border-[#333] rounded mt-2 text-xs">
        {focus === 'all' ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="bg-[#f59e0b] text-black px-1.5 py-0.5 rounded text-[10px] font-bold">#12</span>
              <span className="text-[#999]">{c12} {getWheelsWord(c12)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-[#22c55e] text-black px-1.5 py-0.5 rounded text-[10px] font-bold">#44</span>
              <span className="text-[#999]">{c44} {getWheelsWord(c44)}</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${focus === '12' ? 'bg-[#f59e0b] text-black' : 'bg-[#22c55e] text-black'}`}>
              #{focus}
            </span>
            <span className="text-[#999]">
              {focus === '12' ? c12 : c44} {getWheelsWord(focus === '12' ? c12 : c44)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};