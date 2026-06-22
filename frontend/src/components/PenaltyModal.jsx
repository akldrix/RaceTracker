import {useState} from "react";

export const PenaltyModal = ({penalty, onClose}) => {
    const [desc, setDesc] = useState(penalty.desc.charAt(0).toUpperCase() + penalty.desc.slice(1));
    const [reason, setReason] = useState(penalty.reason || '');

    if (!penalty) return null;

    return (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
             onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div
                className="bg-[#1a1a1a] border border-[#3a3a3a] rounded-xl w-full max-w-[720px] max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="p-5 border-b border-[#333] flex items-center justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="bg-[#22c55e] text-black px-2 py-0.5 rounded text-[10px] font-bold">ОДОБРЕННЫЙ ШТРАФ</span>
                        <span
                            className={`px-2 py-0.5 rounded text-xs font-bold ${penalty.car === 12 ? 'bg-[#f59e0b] text-black' : 'bg-[#22c55e] text-black'}`}>#{penalty.car}</span>
                        <span className="text-sm text-[#999] font-mono">{penalty.turn} · {penalty.time}</span>
                    </div>
                    <button onClick={onClose}
                            className="text-[#888] hover:text-white text-xl bg-transparent border-none cursor-pointer">×
                    </button>
                </div>
                <div className="p-5">
                    <div className="relative rounded-lg overflow-hidden border border-[#2a2a3a] bg-[#0a1020] mb-4"
                         style={{height: '160px'}}>
                        <div className="absolute inset-3">
                            <div
                                className="bg-black/60 border border-[#333] px-2 py-1 rounded text-[11px] font-mono text-[#888]">
                                CAM - {penalty.turn} · REPLAY 08:{penalty.time.replace(':', '')}
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span
                                    className="text-[50px] font-black text-[rgba(59,130,246,0.08)] tracking-[10px]">REPLAY</span>
                            </div>
                            <div className="absolute bottom-0 left-0 flex items-center gap-2">
                                <span
                                    className={`px-2 py-0.5 rounded text-xs font-bold ${penalty.car === 12 ? 'bg-[#f59e0b] text-black' : 'bg-[#22c55e] text-black'}`}>#{penalty.car}</span>
                                <span className="text-xs text-[#999]">{penalty.type} — {penalty.desc}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="text-[10px] tracking-wider text-[#777] uppercase font-semibold block mb-1">Что
                            произошло (редактируемо)</label>
                        <textarea
                            className="w-full bg-[#1a1a1a] border border-[#3a3a3a] rounded p-2 text-[#ddd] text-sm outline-none focus:border-[#f59e0b] resize-y"
                            rows="2"
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="text-[10px] tracking-wider text-[#777] uppercase font-semibold block mb-1">Причина
                            инцидента (редактируемо)</label>
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
                            <div className="text-white font-semibold">#{penalty.car}</div>
                        </div>
                        <div className="bg-[#1a1a1a] border border-[#333] rounded p-3">
                            <div className="text-[#777] mb-1">Трасса</div>
                            <div className="text-white font-semibold">Moscow Raceway</div>
                        </div>
                        <div className="bg-[#1a1a1a] border border-[#333] rounded p-3">
                            <div className="text-[#777] mb-1">Время</div>
                            <div className="text-white font-semibold font-mono">{penalty.time}</div>
                        </div>
                        <div className="bg-[#1a1a1a] border border-[#333] rounded p-3">
                            <div className="text-[#777] mb-1">Колёс за пределами</div>
                            <div className="text-white font-semibold font-mono">4/4</div>
                        </div>
                        <div className="bg-[#1a1a1a] border border-[#333] rounded p-3 sm:col-span-2">
                            <div className="text-[#777] mb-1">Статус</div>
                            <div className="text-[#22c55e] font-semibold">ТРЕК ЛИМИТ (4 Колёса) · ОДОБРЕН</div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 justify-end">
                        <button
                            onClick={() => {
                                navigator.clipboard?.writeText(desc + (reason ? ' | Причина: ' + reason : ''));
                            }}
                            className="bg-[#2a2a2a] text-[#ddd] px-4 py-2 rounded border border-[#3a3a3a] cursor-pointer hover:bg-[#333] hover:border-[#555] transition-colors text-sm"
                        >
                            📋 КОПИРОВАТЬ МЕТКУ
                        </button>
                        <button
                            className="bg-[#2a2a2a] text-[#ddd] px-4 py-2 rounded border border-[#3a3a3a] cursor-pointer hover:bg-[#333] hover:border-[#555] transition-colors text-sm">
                            ⬇ ЭКСПОРТ ФРАГМЕНТА
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};