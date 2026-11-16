FROM python:3.12-slim@sha256:cd7c412d000912f29075a1b8803e43cb2f38bb67f104019df526df5ceaf30569

RUN apt-get update && apt-get install -y \
  ffmpeg \
  libgl1 \
  libglib2.0-0 \
  gcc \
  python3-dev \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /backend

COPY ./requirements.txt ./requirements.txt

RUN pip install --no-cache-dir --upgrade pip setuptools wheel

RUN pip install --no-cache-dir --upgrade -r ./requirements.txt

COPY . .

EXPOSE 8000

CMD ["python", "-m", "uvicorn", "final_server:app", "--host", "0.0.0.0", "--port", "8000"]

