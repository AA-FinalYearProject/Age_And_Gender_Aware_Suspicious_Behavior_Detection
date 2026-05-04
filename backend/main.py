"""
FastAPI backend for M4 Age-Gender-Expression-Suspicion model.
Run: uvicorn main:app --reload --port 8000
"""
import io
import os
import sys
import numpy as np
import cv2
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from keras.models import load_model

# ── constants (must match training) ──────────────────────────────────────────
EMOTIONS          = ['Angry', 'Disgust', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral']
GENDERS           = ['Male', 'Female']
TARGET_SIZE       = (96, 96)
AGE_MAX           = 116.0
SUSPICION_THRESHOLD = 0.35

# ── load model once at startup ────────────────────────────────────────────────
MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'M4_best.keras')
print(f"Loading model from: {MODEL_PATH}", flush=True)
model = load_model(MODEL_PATH)
print("Model loaded.", flush=True)

# ── app ───────────────────────────────────────────────────────────────────────
app = FastAPI(title="Face Analysis API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # tighten in production
    allow_methods=["*"],
    allow_headers=["*"],
)


def preprocess(image_bytes: bytes) -> np.ndarray:
    """Decode bytes → CLAHE → 96×96 → float32 [0,1]"""
    arr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Could not decode image")

    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(4, 4))
    gray  = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray  = clahe.apply(gray)
    img   = cv2.cvtColor(gray, cv2.COLOR_GRAY2RGB)
    img   = cv2.resize(img, TARGET_SIZE)
    img   = img.astype(np.float32) / 255.0
    return img


def run_inference(img: np.ndarray) -> dict:
    x     = np.expand_dims(img, 0)          # (1,96,96,3)
    preds = model.predict(x, verbose=0)

    # assign outputs by position (M4 order: expr, age, gender, susp)
    order = ['expr_out', 'age_out', 'gender_out', 'susp_out']
    assigned = order[:len(preds)]

    raw = {}
    for name, val in zip(assigned, preds):
        raw[name] = val[0]

    result = {}

    # Expression
    if 'expr_out' in raw:
        arr   = np.array(raw['expr_out']).flatten()
        probs = {EMOTIONS[i]: round(float(arr[i]), 4) for i in range(len(arr))}
        top   = EMOTIONS[int(np.argmax(arr))]
        conf  = float(np.max(arr))
        result['expression'] = {'label': top, 'confidence': round(conf, 4), 'probabilities': probs}

    # Age
    if 'age_out' in raw:
        age_years = float(raw['age_out']) * AGE_MAX
        result['age'] = round(age_years, 1)

    # Gender
    if 'gender_out' in raw:
        idx = int(round(float(raw['gender_out'])))
        result['gender'] = {'label': GENDERS[min(idx, 1)], 'raw': round(float(raw['gender_out']), 4)}

    # Suspicion
    if 'susp_out' in raw:
        score = float(raw['susp_out'])
        result['suspicion'] = {
            'score':     round(score, 4),
            'label':     'Suspicious' if score > SUSPICION_THRESHOLD else 'Not suspicious',
            'threshold': SUSPICION_THRESHOLD,
        }

    return result


@app.get("/")
def root():
    return {"status": "ok", "message": "Face Analysis API is running"}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    image_bytes = await file.read()
    try:
        img    = preprocess(image_bytes)
        result = run_inference(img)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    return JSONResponse(content=result)
