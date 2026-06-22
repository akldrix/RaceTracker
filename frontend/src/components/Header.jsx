import {useState} from "react";
import {TRACKS} from "../constants.js";

export const Header = ({track, setTrack, focus, setFocus}) => {
    const [trackOpen, setTrackOpen] = useState(false);

    return (
        <header
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-5 py-3 border-b border-[#2a2a2a] bg-[#1a1a1a] gap-3">
            <div className="flex items-center gap-3">
                <h1 className="text-base font-bold tracking-wider text-white">RaceTrack Analytics</h1>
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:gap-5">
                <div className="relative">
                    <button
                        className="flex items-center gap-2 text-sm text-white cursor-pointer bg-transparent border-none"
                        onClick={() => setTrackOpen(!trackOpen)}
                    >
                        <span className="text-[10px] tracking-wider text-[#777] uppercase font-semibold">ТРАССА:</span>
                        <span className="font-semibold">{track}</span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                             strokeWidth="2">
                            <polyline points="6,9 12,15 18,9"/>
                        </svg>
                    </button>
                    {trackOpen && (
                        <div
                            className="absolute top-full right-0 mt-1 bg-[#222] border border-[#3a3a3a] rounded-lg min-w-[220px] z-50 shadow-xl overflow-hidden">
                            {TRACKS.map((t) => (
                                <div
                                    key={t}
                                    className={`px-3 py-2 cursor-pointer text-sm transition-colors ${
                                        t === track ? 'bg-[#2a2a2a] text-white' : 'text-[#bbb] hover:bg-[#2a2a2a] hover:text-white'
                                    }`}
                                    onClick={() => {
                                        setTrack(t);
                                        setTrackOpen(false);
                                    }}
                                >
                                    {t === track && <span className="text-[#4ade80] mr-1">✓</span>}
                                    {t}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="hidden sm:block w-px h-5 bg-[#3a3a3a]"></div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] tracking-wider text-[#777] uppercase font-semibold">ФОКУС:</span>
                    <select
                        className="bg-[#1a1a1a] border border-[#3a3a3a] text-white px-2 py-1 rounded text-xs cursor-pointer outline-none"
                        value={focus}
                        onChange={(e) => setFocus(e.target.value)}
                    >
                        <option value="all">ВСЕ МАШИНЫ</option>
                        <option value="12">#12</option>
                        <option value="44">#44</option>
                    </select>
                </div>
            </div>
        </header>
    );
};
