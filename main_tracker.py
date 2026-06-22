import cv2
import os
import numpy as np
import threading
import time
import csv
import subprocess
from collections import deque
from datetime import datetime
from ultralytics import YOLO


MODEL_PATH = "runs/segment/train/weights/best.pt"
VIDEO_INPUT = "race_2.mp4"
CLIPS_DIR = "clips"
LOG_FILE = "incidents.csv"

MIN_TRACK_AREA = 20_000
MASK_SMOOTH_FRAMES = 10
VIOLATION_FRAMES = 3
CLIP_PRE_FRAMES = 60
CLIP_POST_FRAMES = 60
INPAINT_KERNEL_SIZE = 51


os.makedirs(CLIPS_DIR, exist_ok=True)


def convert_to_mp4(avi_path, mp4_path):
    """
    Конвертирует AVI (MJPG) в MP4 (H.264) через FFmpeg.
    Если FFmpeg не установлен — просто переименовывает файл.
    """
    try:

        cmd = [
            'ffmpeg', '-y',
            '-i', avi_path,
            '-c:v', 'libx264',
            '-preset', 'fast',
            '-crf', '23',
            '-pix_fmt', 'yuv420p',
            mp4_path
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)

        if result.returncode == 0 and os.path.exists(mp4_path):
            os.remove(avi_path)
            print(f"   🎬 Конвертировано в MP4: {mp4_path}")
            return mp4_path
        else:
            print(f"   ⚠️ FFmpeg ошибка: {result.stderr[:100]}")

            os.rename(avi_path, mp4_path)
            return mp4_path

    except FileNotFoundError:
        print(f"   ⚠️ FFmpeg не найден, сохраняем как AVI")

        return avi_path
    except Exception as e:
        print(f"   ⚠️ Ошибка конвертации: {e}")
        return avi_path


def filter_track_mask(raw_mask, min_area):
    num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(raw_mask, connectivity=8)
    filtered = np.zeros_like(raw_mask)
    for label in range(1, num_labels):
        if stats[label, cv2.CC_STAT_AREA] >= min_area:
            filtered[labels == label] = 1
    return filtered


class TrackMaskSmoother:
    def __init__(self, n_frames):
        self.buffer = deque(maxlen=n_frames) if n_frames > 0 else None

    def update(self, mask):
        if self.buffer is None:
            return mask
        self.buffer.append(mask.astype(np.float32))
        avg = np.mean(self.buffer, axis=0)
        return (avg >= 0.5).astype(np.uint8)


def restore_track_under_cars(track_mask, car_masks):
    if not car_masks:
        return track_mask
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (INPAINT_KERNEL_SIZE, INPAINT_KERNEL_SIZE))
    result = cv2.dilate(track_mask, kernel, iterations=1)
    for car_mask in car_masks:
        contours, _ = cv2.findContours(car_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if contours:
            hull = cv2.convexHull(np.vstack(contours))
            cv2.fillConvexPoly(result, hull, 1)
    return cv2.bitwise_or(track_mask, result)


def wheel_belongs_to_car(w_box, car_bbox, margin=20):
    w_cx = (w_box[0] + w_box[2]) / 2
    w_cy = (w_box[1] + w_box[3]) / 2
    return (car_bbox[0] - margin <= w_cx <= car_bbox[2] + margin and
            car_bbox[1] - margin <= w_cy <= car_bbox[3] + margin)


def is_wheel_off_track(wheel_mask, track_mask_restored):
    wheel_area = np.sum(wheel_mask > 0)
    if wheel_area == 0:
        return False
    intersection = cv2.bitwise_and(wheel_mask, track_mask_restored)
    overlap_ratio = np.sum(intersection > 0) / wheel_area
    return overlap_ratio < 0.2


class RaceTracker:
    def __init__(self):
        self.latest_frame = None
        self.lock = threading.Lock()
        self.is_running = False
        self.thread = None

        self.incident_id = 0
        self.violation_counters = {}
        self.active_violations = set()
        self.active_clip_writers = {}
        self.frame_buffer = deque(maxlen=CLIP_PRE_FRAMES)

    def start(self):
        if not self.is_running:
            self.is_running = True
            self.thread = threading.Thread(target=self._process_video, daemon=True)
            self.thread.start()
            print("✅ Видео-трекер запущен в фоновом режиме.")

    def stop(self):
        self.is_running = False
        if self.thread:
            self.thread.join(timeout=2.0)
        for entry in self.active_clip_writers.values():
            if entry[0] is not None:
                entry[0].release()

    def get_latest_frame(self):
        with self.lock:
            return self.latest_frame.copy() if self.latest_frame is not None else None

    def _process_video(self):
        print(f"🎬 Загрузка модели из {MODEL_PATH}...")
        model = YOLO(MODEL_PATH)
        print(f"📹 Открытие видео {VIDEO_INPUT}...")
        cap = cv2.VideoCapture(VIDEO_INPUT)

        if not cap.isOpened():
            print(f"❌ Ошибка: не удалось открыть {VIDEO_INPUT}")
            self.is_running = False
            return

        frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = int(cap.get(cv2.CAP_PROP_FPS)) or 30

        print(f"📊 Видео: {frame_width}x{frame_height} @ {fps} FPS")


        print("🔍 Тестирование VideoWriter...")
        test_path = os.path.join(CLIPS_DIR, "test.avi")
        test_fourcc = cv2.VideoWriter_fourcc(*'MJPG')
        test_writer = cv2.VideoWriter(test_path, test_fourcc, fps, (frame_width, frame_height))

        if test_writer.isOpened():
            test_frame = np.zeros((frame_height, frame_width, 3), dtype=np.uint8)
            test_frame[:] = (128, 128, 128)
            for _ in range(10):
                test_writer.write(test_frame)
            test_writer.release()

            if os.path.exists(test_path) and os.path.getsize(test_path) > 0:
                print(f"✅ VideoWriter работает!")
                os.remove(test_path)
            else:
                print(f"❌ VideoWriter открылся, но файл пустой")
                self.is_running = False
                return
        else:
            print(f"❌ VideoWriter НЕ работает!")
            self.is_running = False
            return


        try:
            subprocess.run(['ffmpeg', '-version'], capture_output=True, timeout=5)
            print("✅ FFmpeg найден — клипы будут конвертироваться в MP4")
        except:
            print("⚠️ FFmpeg не найден — клипы будут сохраняться как AVI")
            print("   Установите FFmpeg для конвертации в MP4: https://ffmpeg.org/download.html")

        smoother = TrackMaskSmoother(MASK_SMOOTH_FRAMES)
        frame_no = 0

        while self.is_running and cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                continue

            frame_no += 1
            overlay = frame.copy()
            results = model.track(frame, persist=True, verbose=False, tracker="bytetrack.yaml")

            cars, wheels = [], []
            track_mask_raw = np.zeros((frame_height, frame_width), dtype=np.uint8)
            track_detected = False

            if results[0].masks is not None and results[0].boxes is not None:
                masks = results[0].masks.data.cpu().numpy()
                boxes = results[0].boxes

                for i, box in enumerate(boxes):
                    cls_id = int(box.cls[0].item())
                    mask_resized = cv2.resize(masks[i], (frame_width, frame_height), interpolation=cv2.INTER_NEAREST)
                    binary_mask = (mask_resized > 0.5).astype(np.uint8)

                    if cls_id == 0:
                        track_mask_raw = cv2.bitwise_or(track_mask_raw, binary_mask)
                        track_detected = True
                    elif cls_id == 2:
                        track_id = int(box.id[0].item()) if box.id is not None else -1
                        cars.append({"id": track_id, "mask": binary_mask, "bbox": box.xyxy[0].cpu().numpy()})
                    elif cls_id == 1:
                        wheels.append({"mask": binary_mask, "bbox": box.xyxy[0].cpu().numpy()})

            if track_detected:
                track_filtered = filter_track_mask(track_mask_raw, MIN_TRACK_AREA)
                track_stable = smoother.update(track_filtered)
            else:
                track_stable = smoother.update(np.zeros((frame_height, frame_width), dtype=np.uint8))

            track_analysis = restore_track_under_cars(track_stable, [c["mask"] for c in cars])

            if np.any(track_stable > 0):
                contours, _ = cv2.findContours(track_stable, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
                cv2.drawContours(overlay, contours, -1, (0, 220, 100), 2)

            for car in cars:
                car_id = car["id"]
                car_bbox = car["bbox"]
                off_count = 0
                track_available = np.any(track_analysis > 0)
                overlay[car["mask"] == 1] = [0, 220, 80]

                for wheel in wheels:
                    if not wheel_belongs_to_car(wheel["bbox"], car_bbox):
                        continue
                    overlay[wheel["mask"] == 1] = [0, 160, 255]
                    if track_available and is_wheel_off_track(wheel["mask"], track_analysis):
                        off_count += 1
                        overlay[wheel["mask"] == 1] = [0, 0, 220]

                if off_count > 0:
                    self.violation_counters[car_id] = self.violation_counters.get(car_id, 0) + 1
                else:
                    self.violation_counters[car_id] = 0
                    self.active_violations.discard(car_id)


                if (self.violation_counters.get(car_id, 0) >= VIOLATION_FRAMES and
                        car_id not in self.active_violations):

                    self.active_violations.add(car_id)
                    self.incident_id += 1
                    ts_str = datetime.now().strftime("%H:%M:%S.%f")[:-3]
                    itype = "FULL_OFF" if off_count == 4 else "PARTIAL_OFF"


                    temp_name = f"incident_{self.incident_id:03d}_car{car_id}.avi"
                    temp_path = os.path.abspath(os.path.join(CLIPS_DIR, temp_name))

                    final_name = f"incident_{self.incident_id:03d}_car{car_id}.mp4"
                    final_path = os.path.abspath(os.path.join(CLIPS_DIR, final_name))

                    print(f"🚨 ИНЦИДЕНТ #{self.incident_id}: Болид {car_id}, {off_count}/4 колес")
                    print(f"   Временный файл: {temp_path}")

                    fourcc = cv2.VideoWriter_fourcc(*'MJPG')
                    writer = cv2.VideoWriter(temp_path, fourcc, fps, (frame_width, frame_height))

                    if not writer.isOpened():
                        print(f"❌ Ошибка: VideoWriter не открылся!")
                        self.active_violations.discard(car_id)
                        continue

                    for f_buf in self.frame_buffer:
                        writer.write(f_buf)

                    self.active_clip_writers[car_id] = [
                        writer, CLIP_POST_FRAMES, final_path, temp_path,
                        ts_str, itype, off_count, frame_no
                    ]
                    print(f"   ✅ Запись началась (осталось {CLIP_POST_FRAMES} кадров)")


                x1, y1, x2, y2 = map(int, car_bbox)
                if off_count == 4:
                    cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 255), 4)
                    cv2.putText(frame, f"ID {car_id}: FULL OFF-TRACK (4/4)", (x1, y1 - 10),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
                    cv2.rectangle(frame, (10, 10), (700, 60), (0, 0, 200), -1)
                    cv2.putText(frame, f"JUDGE ALERT: CAR {car_id} FULLY OFF TRACK!", (20, 45),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 3)
                elif off_count > 0:
                    cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 165, 255), 2)
                    cv2.putText(frame, f"ID {car_id}: Warning ({off_count}/4)", (x1, y1 - 10),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 165, 255), 2)
                else:
                    cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 220, 0), 2)
                    cv2.putText(frame, f"Car ID {car_id}", (x1, y1 - 10),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 220, 0), 1)

            cv2.addWeighted(overlay, 0.45, frame, 0.55, 0, frame)


            finished = []
            for cid, entry in self.active_clip_writers.items():
                writer, frames_left, final_path, temp_path, ts_str, itype, off_count, start_frame = entry
                writer.write(frame)
                frames_left -= 1

                if frames_left <= 0:
                    print(f"✅ Завершение записи инцидента {cid}...")
                    writer.release()


                    if os.path.exists(temp_path):
                        actual_file = convert_to_mp4(temp_path, final_path)
                        actual_name = os.path.basename(actual_file)

                        file_size = os.path.getsize(actual_file)
                        print(f"📁 Файл сохранен: {actual_file} ({file_size / 1024 / 1024:.2f} MB)")


                        try:
                            with open(LOG_FILE, "a", newline="", encoding="utf-8") as f:
                                csv_writer = csv.DictWriter(f, fieldnames=[
                                    "incident", "frame", "timestamp", "car_id",
                                    "wheels_out", "type", "clip"
                                ])
                                if f.tell() == 0:
                                    csv_writer.writeheader()
                                csv_writer.writerow({
                                    "incident": self.incident_id,
                                    "frame": start_frame,
                                    "timestamp": ts_str,
                                    "car_id": cid,
                                    "wheels_out": off_count,
                                    "type": itype,
                                    "clip": actual_name
                                })
                            print(f"📝 Запись добавлена в {LOG_FILE}")
                        except Exception as e:
                            print(f"❌ Ошибка при записи в CSV: {e}")
                    else:
                        print(f"   ❌ Временный файл не найден!")

                    finished.append(cid)

            for cid in finished:
                del self.active_clip_writers[cid]

            self.frame_buffer.append(frame.copy())
            with self.lock:
                self.latest_frame = frame

            time.sleep(0.01)

        cap.release()
        print("⏹️ Фоновый поток обработки завершён.")