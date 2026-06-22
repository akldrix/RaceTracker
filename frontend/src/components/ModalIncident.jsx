import { useState } from "react";
export const IncidentModal = ({ incident, onClose, onConfirm, onReject }) => {

const [desc, setDesc] = useState(incident.detail ? incident.detail.charAt(0).toUpperCase() + incident.detail.slice(1) : "Нет описания");
  const [reason, setReason] = useState(incident.reason || '');

  if (!incident) return null;

  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-[#1a1a1a] border border-[#3a3a3a] rounded-xl w-full max-w-[720px] max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-5 border-b border-[#333] flex items-center justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-[#f59e0b] text-black px-2 py-0.5 rounded text-[10px] font-bold">ИНЦИДЕНТ №{incident.id}</span>
            <span className={`px-2 py-0.5 rounded text-xs font-bold ${incident.car === 12 ? 'bg-[#f59e0b] text-black' : 'bg-[#22c55e] text-black'}`}>#{incident.car}</span>
            <span className="text-sm text-[#999]">LAP {incident.lap} · {incident.turn}</span>
          </div>
          <button onClick={onClose} className="text-[#888] hover:text-white text-xl bg-transparent border-none cursor-pointer">×</button>
        </div>
        <div className="p-5">
          <div className="relative rounded-lg overflow-hidden border border-[#2a2a3a] bg-[#0a1020] mb-4" style={{ height: '180px' }}>
            <div className="absolute inset-3">
              <div className="bg-black/60 border border-[#333] px-2 py-1 rounded text-[11px] font-mono text-[#22c55e] inline-block">
                CAM 03 - {incident.turn} | LAP {incident.lap} | SECTOR 1
              </div>
              <div className="absolute top-0 right-0 flex items-center gap-2 bg-black/60 border border-[#333] px-2 py-1 rounded">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-[#f59e0b]"><polygon points="6,3 20,12 6,21"/></svg>
                <span className="text-[#f59e0b] text-xs font-mono">REPLAY: -5.0s (0.5×)</span>
                <span className="text-[#888]">|</span>
                <span className="text-[#999] text-xs font-mono">5.0s</span>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[50px] font-black text-[rgba(59,130,246,0.08)] tracking-[10px]">REPLAY</span>
              </div>
              <div className="absolute bottom-0 left-0 flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${incident.car === 12 ? 'bg-[#f59e0b] text-black' : 'bg-[#22c55e] text-black'}`}>#{incident.car}</span>
                <span className="text-xs text-[#999]">| {incident.detail}</span>
              </div>
              <div className="absolute bottom-0 right-0 flex items-center gap-2 bg-black/60 border border-[#333] px-2 py-1 rounded">
                <span className="text-[#999] text-xs font-mono">08:42</span>
                <span className="text-[#777]">/</span>
                <span className="text-[#999] text-xs font-mono">01:23</span>
              </div>
            </div>
          </div>

          <div className="mb-3">
            <label className="text-[10px] tracking-wider text-[#777] uppercase font-semibold block mb-1">Что произошло (редактируемо)</label>
            <textarea
              className="w-full bg-[#1a1a1a] border border-[#3a3a3a] rounded p-2 text-[#ddd] text-sm outline-none focus:border-[#f59e0b] resize-y"
              rows="2"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="text-[10px] tracking-wider text-[#777] uppercase font-semibold block mb-1">Причина инцидента (редактируемо)</label>
            <textarea
              className="w-full bg-[#1a1a1a] border border-[#3a3a3a] rounded p-2 text-[#ddd] text-sm outline-none focus:border-[#f59e0b] resize-y"
              rows="2"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5 text-xs">
            <div className="bg-[#1a1a1a] border border-[#333] rounded p-3">
              <div className="text-[#777] mb-1">Болид</div>
              <div className="text-white font-semibold">#{incident.car}</div>
            </div>
            <div className="bg-[#1a1a1a] border border-[#333] rounded p-3">
              <div className="text-[#777] mb-1">Трасса</div>
              <div className="text-white font-semibold">Moscow Raceway</div>
            </div>
            <div className="bg-[#1a1a1a] border border-[#333] rounded p-3">
              <div className="text-[#777] mb-1">Время</div>
              <div className="text-white font-semibold font-mono">{incident.time}</div>
            </div>
            <div className="bg-[#1a1a1a] border border-[#333] rounded p-3">
              <div className="text-[#777] mb-1">Колёс за пределами</div>
              <div className="text-white font-semibold font-mono">{incident.wheels}/4</div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => onReject(incident.id, desc, reason)}
              className="bg-[#4a4a4a] text-[#e0e0e0] font-bold px-6 py-2.5 rounded border-none cursor-pointer hover:bg-[#5a5a5a] hover:text-white transition-colors"
            >
              ОТКЛОНИТЬ
            </button>
            <button
              onClick={() => onConfirm(incident.id, desc, reason)}
              className="bg-[#ef4444] text-white font-bold px-6 py-2.5 rounded border-none cursor-pointer hover:bg-[#dc2626] transition-colors"
            >
              ПОДТВЕРДИТЬ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};