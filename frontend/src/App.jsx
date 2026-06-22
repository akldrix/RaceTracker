import { useState, useEffect, useRef, useCallback } from "react";
import { Header } from "./components/Header";
import { ReplayCamera } from "./components/ReplayCamera";
import { VideoControls } from "./components/VideoControls";
import { LiveCamera } from "./components/LiveCamera";
import { TrackMap } from "./components/TrackMap";
import { PenaltyList } from "./components/PenaltyList";
import { IncidentQueue } from "./components/IncidentQueue";
import { IncidentModal } from "./components/ModalIncident";
import { PenaltyModal } from "./components/PenaltyModal";
import Toast from "./components/Toast";
import { TOTAL_TIME, ZOOM_LEVELS, API_BASE } from "./constants";

export default function App() {
  const [track, setTrack] = useState("Moscow Raceway");
  const [focus, setFocus] = useState("all");

  const [penalties, setPenalties] = useState([]);
  const [queue, setQueue] = useState([]);

  const [activeVideo, setActiveVideo] = useState("live");
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(0.5);
  const [time, setTime] = useState(27);
  const [zoomIdx, setZoomIdx] = useState(0);
  const [penaltiesCollapsed, setPenaltiesCollapsed] = useState(false);
  const [incidentId, setIncidentId] = useState(null);
  const [penaltyIdx, setPenaltyIdx] = useState(null);
  const [toast, setToast] = useState(null);

  const [rejectedIds, setRejectedIds] = useState([]);
  const [currentReplayUrl, setCurrentReplayUrl] = useState(null);
  const [currentReplayIncident, setCurrentReplayIncident] = useState(null);

  const playRef = useRef(null);

  const fetchIncidents = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/incidents`);
      const data = await response.json();

      setQueue((prevQueue) => {
        const currentPenaltyIds = new Set(penalties.map((p) => p.id));
        const rejectedSet = new Set(rejectedIds);

        const activeIncidents = data.filter(
          (inc) => !currentPenaltyIds.has(inc.id) && !rejectedSet.has(inc.id)
        );

        const existingIds = new Set(prevQueue.map((q) => q.id));
        const newIncidents = activeIncidents.filter((inc) => !existingIds.has(inc.id));

        if (newIncidents.length > 0) {
          const newest = newIncidents[newIncidents.length - 1];

          const videoUrl = newest.clip.startsWith("http")
            ? newest.clip
            : `${API_BASE}${newest.clip.startsWith("/") ? "" : "/"}${newest.clip}`;

          setCurrentReplayUrl(videoUrl);
          setCurrentReplayIncident(newest);
          setActiveVideo("replay");

          console.log(`🚨 Новый инцидент #${newest.id}: переключение на реплей`);
        }

        return activeIncidents;
      });
    } catch (error) {
      console.error("Ошибка загрузки инцидентов:", error);
    }
  }, [penalties, rejectedIds]);

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 2000);
    return () => clearInterval(interval);
  }, [fetchIncidents]);

  useEffect(() => {
    if (isPlaying) {
      playRef.current = setInterval(() => {
        setTime((prev) => {
          const next = prev + speed;
          if (next >= TOTAL_TIME) {
            setIsPlaying(false);
            return TOTAL_TIME;
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(playRef.current);
  }, [isPlaying, speed]);

  const showToast = useCallback((msg) => setToast(msg), []);


  const handleViewIncident = useCallback((id) => {
    const incident = queue.find((q) => q.id === id);
    if (!incident) return;

    const videoUrl = incident.clip.startsWith("http")
      ? incident.clip
      : `${API_BASE}${incident.clip.startsWith("/") ? "" : "/"}${incident.clip}`;

    setCurrentReplayUrl(videoUrl);
    setCurrentReplayIncident(incident);
    setActiveVideo("replay");
    setIncidentId(id);

    console.log(`️ Просмотр инцидента #${id}`);
  }, [queue]);

  const handleConfirm = (id, desc, reason) => {
    const idx = queue.findIndex((q) => q.id === id);
    if (idx === -1) return;
    const q = queue[idx];
    const newPenalty = {
      id: q.id,
      car: q.car,
      wheels: q.wheels + "/4",
      turn: q.turn || "Turn X",
      time: q.time,
      type: q.type,
      desc: desc || q.detail,
      reason: reason || q.reason || "",
    };
    setPenalties((prev) => [...prev, newPenalty]);
    setQueue((prev) => prev.filter((x) => x.id !== id));
    setIncidentId(null);
    showToast("Инцидент подтверждён и добавлен в одобренные штрафы");
  };

  const handleReject = (id) => {
    setRejectedIds((prev) => [...prev, id]);
    setQueue((prev) => prev.filter((x) => x.id !== id));
    setIncidentId(null);
    showToast("Инцидент отклонён и удалён из очереди");
  };

  const currentIncident = incidentId ? queue.find((q) => q.id === incidentId) : null;
  const currentPenalty = penaltyIdx !== null ? penalties[penaltyIdx] : null;

  return (
    <div className="h-screen flex flex-col p-2 sm:p-3 bg-[#111] text-[#e0e0e0] font-sans overflow-hidden">
      <div className="flex-1 rounded-xl overflow-hidden flex flex-col bg-[#161616] border border-[#2a2a2a]">
        <Header track={track} setTrack={setTrack} focus={focus} setFocus={setFocus} />

        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          <div className="flex-1 min-w-0 flex flex-col p-3 sm:p-4 gap-3 overflow-y-auto lg:overflow-hidden">
            <div className="flex flex-col gap-3 flex-1 min-h-0">
              <LiveCamera active={activeVideo === "live"} onClick={() => setActiveVideo("live")} />
              <ReplayCamera
                active={activeVideo === "replay"}
                expanded={activeVideo === "replay"}
                onClick={() => setActiveVideo("replay")}
                speed={speed}
                time={time}
                videoUrl={currentReplayUrl}
                incident={currentReplayIncident}
              />
            </div>
            <VideoControls
              isPlaying={isPlaying}
              onTogglePlay={() => setIsPlaying(!isPlaying)}
              onSkipBack={() => setTime(Math.max(0, time - 5))}
              onSkipForward={() => setTime(Math.min(TOTAL_TIME, time + 5))}
              speed={speed}
              setSpeed={setSpeed}
              time={time}
              setTime={setTime}
              total={TOTAL_TIME}
            />
          </div>

          <div className="w-full lg:w-[400px] border-t lg:border-t-0 lg:border-l border-[#2a2a2a] bg-[#161616] flex-shrink-0 flex flex-col overflow-hidden">
            <TrackMap
              track={track}
              zoomIdx={zoomIdx}
              onZoomIn={() => setZoomIdx(Math.min(ZOOM_LEVELS.length - 1, zoomIdx + 1))}
              onZoomOut={() => setZoomIdx(Math.max(0, zoomIdx - 1))}
              focus={focus}
              penalties={penalties}
            />
            <PenaltyList
              penalties={penalties}
              focus={focus}
              onOpen={(i) => setPenaltyIdx(i)}
              collapsed={penaltiesCollapsed}
              onToggle={() => setPenaltiesCollapsed(!penaltiesCollapsed)}
            />
            <IncidentQueue
              queue={queue}
              focus={focus}
              onOpen={handleViewIncident}
            />
          </div>
        </div>
      </div>

      {currentIncident && (
        <IncidentModal
          incident={currentIncident}
          onClose={() => setIncidentId(null)}
          onConfirm={handleConfirm}
          onReject={handleReject}
        />
      )}

      {currentPenalty && <PenaltyModal penalty={currentPenalty} onClose={() => setPenaltyIdx(null)} />}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}