from ultralytics import YOLO


def main():

    model = YOLO("yolov8s-seg.pt")

    print("Начало обучения")

    results = model.train(
        data="data.yaml",
        epochs=50,
        imgsz=640,
        batch=16,
        device=0,
        workers=4,
        amp=True,
        cache=True,
        plots=False,
        augment=True,
        degrees=10.0,
        perspective=0.0001,
        mosaic=1.0,
    )

    print("Обучение завершено")
    print("Путь к модели: runs/segment/train/weights/best.pt")


if __name__ == "__main__":
    main()
