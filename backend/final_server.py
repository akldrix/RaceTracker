from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import cv2
import time
import os
import csv
from main_tracker import RaceTracker

tracker = RaceTracker()


@asynccontextmanager
async def lifespan(app: FastAPI):
    tracker.start()
    yield
    tracker.stop()


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("clips", exist_ok=True)
# Исправлено: FastAPI снова слушает /clips, так как Nginx отрезает /api/ при проксировании
app.mount("/clips", StaticFiles(directory="clips"), name="clips")


def generate_mjpeg_stream():
    while True:
        frame = tracker.get_latest_frame()
        if frame is None:
            time.sleep(0.1)
            continue
        ret, buffer = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
        if not ret:
            continue
        yield (
            b"--frame\r\n"
            b"Content-Type: image/jpeg\r\n\r\n" + buffer.tobytes() + b"\r\n"
        )
        time.sleep(0.03)


@app.get("/video_feed")
def video_feed():
    return StreamingResponse(
        generate_mjpeg_stream(), media_type="multipart/x-mixed-replace; boundary=frame"
    )


@app.get("/api/incidents")
def get_incidents():
    incidents = []
    log_file = "incidents.csv"

    if not os.path.exists(log_file):
        return incidents

    with open(log_file, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            clip_name = row.get("clip", "").strip()
            # Оставляем путь /clips/, фронтенд сам дописывает префикс /api/
            clip_url = f"/clips/{clip_name}" if clip_name else ""

            incidents.append(
                {
                    "id": int(row["incident"]),
                    "time": row["timestamp"],
                    "car": int(row["car_id"]),
                    "wheels": int(row["wheels_out"]),
                    "type": row["type"],
                    "detail": "Выезд за пределы трассы",
                    "clip": clip_url,
                }
            )

    incidents.sort(key=lambda x: x["id"], reverse=True)
    return incidents
