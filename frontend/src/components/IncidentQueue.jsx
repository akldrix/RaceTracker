import { getQueueWord } from "../utils/helpers";
export const IncidentQueue = ({ queue, focus, onOpen }) => {
  const filtered = focus === 'all' ? queue : queue.filter(q => q.car === parseInt(focus));

  return (
    <div className="p-4 overflow-y-auto" style={{ maxHeight: '220px' }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] tracking-wider text-[#777] uppercase font-semibold">ОЧЕРЕДЬ ИНЦИДЕНТОВ</span>
        <span className="text-[11px] font-mono text-[#f59e0b] font-bold">{filtered.length} {getQueueWord(filtered.length)}</span>
      </div>
      {filtered.length === 0 ? (
        <div className="text-center py-5 text-[#666] text-xs border border-dashed border-[#333] rounded">Очередь пуста</div>
      ) : (
        filtered.map(q => (
          <div
            key={q.id}
            className="bg-[#1e1e1e] border border-[#3a3a3a] border-l-[3px] border-l-[#f59e0b] rounded p-2.5 mb-1.5 cursor-pointer hover:bg-[#262626] hover:border-[#555] transition-colors"
            onClick={() => onOpen(q.id)}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-[#f59e0b] font-bold">№{q.id}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${q.car === 12 ? 'bg-[#f59e0b] text-black' : 'bg-[#22c55e] text-black'}`}>
                  #{q.car}
                </span>
               <span className="text-[11px] text-[#999]">TIME: {q.time}</span>
              </div>
              <span className="text-[10px] font-mono text-[#888]">{q.wheels} КОЛЕСА</span>
            </div>
            <div className="text-[11px] text-[#999]">{q.detail}</div>
          </div>
        ))
      )}
    </div>
  );
};