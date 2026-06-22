export const PenaltyList = ({ penalties, focus, onOpen, collapsed, onToggle }) => {
  const filtered = focus === 'all' ? penalties : penalties.filter(p => p.car === parseInt(focus));

  return (
    <div className="p-4 border-b border-[#2a2a2a] flex-1 flex flex-col min-h-0">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] tracking-wider text-[#777] uppercase font-semibold">ОДОБРЕННЫЕ ШТРАФЫ</span>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-[#f59e0b] font-bold">{filtered.length}</span>
          <button
            onClick={onToggle}
            className="w-7 h-7 rounded-full bg-[#2a2a2a] border border-[#444] text-[#ccc] flex items-center justify-center hover:bg-[#3a3a3a] hover:text-white transition-colors"
            title="Свернуть/развернуть"
          >
            <svg
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              style={{ transform: collapsed ? 'rotate(-90deg)' : 'none', transition: 'transform 0.25s' }}
            >
              <polyline points="6,9 12,15 18,9"/>
            </svg>
          </button>
        </div>
      </div>
      {!collapsed && (
        <div className="overflow-y-auto flex-1 pr-1">
          {filtered.length === 0 ? (
            <div className="text-center py-5 text-[#666] text-xs border border-dashed border-[#333] rounded">Нет одобренных штрафов</div>
          ) : (
            filtered.map((p, i) => (
              <div
                key={i}
                className="bg-[#1e1e1e] border border-[#333] rounded p-2.5 mb-1.5 cursor-pointer hover:border-[#4a4a4a] hover:bg-[#242424] transition-colors"
                onClick={() => onOpen(i)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${p.car === 12 ? 'bg-[#f59e0b] text-black' : 'bg-[#22c55e] text-black'}`}>
                      #{p.car}
                    </span>
                    <span className="text-[#ef4444] font-bold text-xs font-mono">{p.wheels}</span>
                    {[0,1,2,3].map(j => <span key={j} className="w-2 h-2 rounded-full bg-[#ef4444]"></span>)}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-[#999]">{p.turn} {p.time}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); }}
                      className="w-6 h-6 rounded-full bg-transparent border border-[#3a3a3a] text-[#999] flex items-center justify-center hover:border-[#666] hover:text-white"
                      title="Экспорт"
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="text-[11px] text-[#888] mt-1">{p.type} — {p.desc}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};