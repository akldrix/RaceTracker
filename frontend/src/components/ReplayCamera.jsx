import React, { useState, useEffect } from 'react';

export const ReplayCamera = ({
  active,
  expanded,
  onClick,
  speed,
  time,
  videoUrl,
  incident
}) => {
  const [videoError, setVideoError] = useState(null);
  const [videoLoading, setVideoLoading] = useState(false);


  useEffect(() => {
    if (videoUrl) {
      console.log('🎥 Video URL:', videoUrl);
      setVideoError(null);
      setVideoLoading(true);
    }
  }, [videoUrl]);

  if (!incident) {
    return (
      <div
        className={`relative rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ${
          expanded
            ? 'flex-1 min-h-[200px] border-[#3b82f6]'
            : 'h-12 border-[#2a2a3a]'
        } border bg-[#0a1020]`}
        onClick={onClick}
      >
        <div className="flex items-center justify-center h-full">
          <span className="text-[#555] text-xs font-mono">ОЖИДАНИЕ ИНЦИДЕНТОВ...</span>
        </div>
      </div>
    );
  }

  const { id, time: incTime, car, wheels, type } = incident;
  const isFullOff = type === "FULL_OFF";
  const statusColor = isFullOff ? "bg-[#ef4444]" : "bg-[#f59e0b]";
  const statusText = isFullOff ? "КРИТИЧЕСКИЙ ИНЦИДЕНТ" : "ЗАПИСЬ ИНЦИДЕНТА";

  return (
    <div
      className={`relative rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ${
        expanded
          ? 'flex-1 min-h-[300px] border-[#3b82f6] shadow-lg shadow-blue-900/20'
          : 'h-12 border-[#2a2a3a] hover:border-[#444]'
      } border bg-[#0a1020]`}
      onClick={onClick}
    >
      {!expanded ? (
        <div className="flex items-center gap-3 h-full px-3">
          <span className={`${statusColor} text-black px-2 py-0.5 rounded text-[10px] font-bold`}>
            {statusText}
          </span>
          <span className="bg-black/60 border border-[#333] px-2 py-0.5 rounded text-[11px] font-mono text-[#888]">
            CAR {car} | INC #{id}
          </span>
          <span className={`w-1.5 h-1.5 rounded-full ${statusColor} animate-pulse`}></span>
          <span className="text-[#999] text-xs font-mono">{incTime}</span>
          <span className="flex-1"></span>
          <div className="flex gap-1 items-center mr-2">
            {[0, 1, 2, 3].map(i => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full border transition-colors ${
                  i < wheels ? 'bg-[#ef4444] border-[#ef4444]' : 'bg-transparent border-[#444]'
                }`}
              ></span>
            ))}
          </div>
          <span className="text-[#888] text-xs font-mono flex items-center gap-1 hover:text-white transition-colors">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15,3 21,3 21,9"/><polyline points="9,21 3,21 3,15"/>
              <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
            </svg>
            РАЗВЕРНУТЬ
          </span>
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-col">

          <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-3 bg-gradient-to-b from-black/80 to-transparent z-10 pointer-events-none">
            <div className="flex items-center gap-2 pointer-events-auto">
              <span className={`${statusColor} text-black px-2 py-0.5 rounded text-[10px] font-bold`}>
                {statusText}
              </span>
              <span className="bg-black/60 border border-[#333] px-2 py-0.5 rounded text-[11px] font-mono text-[#888]">
                CAR {car} | INC #{id}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-black/60 border border-[#333] px-2 py-1 rounded pointer-events-auto">
              <span className={`w-1.5 h-1.5 rounded-full ${statusColor} animate-pulse`}></span>
              <span className="text-[#999] text-xs font-mono">{incTime}</span>
            </div>
          </div>


          <div className="flex-1 bg-black flex items-center justify-center relative">
            {videoUrl ? (
              videoError ? (

                <div className="flex flex-col items-center gap-4 p-4">
                  <div className="text-[#ef4444] text-lg font-bold">⚠️ ОШИБКА ВИДЕО</div>
                  <div className="text-[#888] text-sm font-mono text-center max-w-md">
                    {videoError}
                  </div>
                  <div className="text-[#666] text-xs font-mono break-all">
                    URL: {videoUrl}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setVideoError(null);
                      setVideoLoading(true);
                    }}
                    className="px-4 py-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded text-sm"
                  >
                    Повторить загрузку
                  </button>
                </div>
              ) : videoLoading ? (

                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-[#3b82f6] border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-[#888] text-sm font-mono">Загрузка видео...</span>
                  <span className="text-[#555] text-xs font-mono break-all max-w-md text-center">
                    {videoUrl}
                  </span>
                </div>
              ) : (

                <video
                  key={videoUrl}
                  className="w-full h-full object-contain"
                  src={videoUrl}
                  controls
                  autoPlay
                  muted
                  playsInline
                  onLoadedData={() => {
                    console.log('✅ Видео загружено успешно');
                    setVideoLoading(false);
                  }}
                  onError={(e) => {
                    console.error('❌ Ошибка видео:', e);
                    console.error('❌ URL:', videoUrl);
                    setVideoLoading(false);
                    setVideoError(
                      e.target.error?.message || 'Не удалось загрузить видео файл'
                    );
                  }}
                  onWaiting={() => setVideoLoading(true)}
                  onPlaying={() => setVideoLoading(false)}
                />
              )
            ) : (
              <div className="flex flex-col items-center gap-4">
                <span className="text-[60px] sm:text-[80px] font-black text-[rgba(59,130,246,0.08)] tracking-[10px] animate-pulse">
                  REPLAY
                </span>
                <span className="text-[#555] text-sm font-mono">Нет доступного видео</span>
              </div>
            )}
          </div>


          <div className="absolute bottom-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent z-10 pointer-events-none">
            <div className="flex flex-col items-end gap-1 pointer-events-auto">
              <div className="flex gap-1.5">
                {[0, 1, 2, 3].map(i => (
                  <span
                    key={i}
                    className={`w-3 h-3 rounded-full border-2 transition-colors ${
                      i < wheels ? 'bg-[#ef4444] border-[#ef4444]' : 'bg-transparent border-[#555]'
                    }`}
                  ></span>
                ))}
              </div>
              <span className="text-[11px] text-[#fff] font-mono font-bold tracking-wide">
                {wheels}/4 КОЛЕСА ВНЕ ТРАССЫ
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};