from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import tensorflow as tf
import pickle
import json
import numpy as np
import shutil
import os

from preprocessing import extract_features

app = FastAPI(title="Speech Emotion Recognition API")

# Allow our future React frontend (running on a different port) to talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load everything ONCE, when the server starts
model = tf.keras.models.load_model('models/model.keras')

with open('models/label_encoder.pkl', 'rb') as f:
    label_encoder = pickle.load(f)

with open('models/config.json', 'r') as f:
    config = json.load(f)

print("Model, encoder, and config loaded. Server ready.")


@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Server is running"}


@app.post("/predict")
async def predict_emotion(file: UploadFile = File(...)):
    # Basic validation: only accept audio-like files
    if not file.filename.endswith(('.wav', '.mp3')):
        raise HTTPException(status_code=400, detail="Please upload a .wav or .mp3 file")

    # Save the uploaded file temporarily so librosa can read it
    temp_path = os.path.join("uploads", file.filename)
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        # Preprocess exactly like training
        features = extract_features(temp_path, config)

        # Predict
        probabilities = model.predict(features)[0]
        predicted_index = np.argmax(probabilities)
        predicted_emotion = label_encoder.inverse_transform([predicted_index])[0]
        confidence = float(probabilities[predicted_index])

        # Build "Top 3 predictions" list, matching your project's example output
        top_3_indices = np.argsort(probabilities)[::-1][:3]
        top_3 = [
            {
                "emotion": label_encoder.inverse_transform([idx])[0],
                "confidence": float(probabilities[idx])
            }
            for idx in top_3_indices
        ]

        return {
            "predicted_emotion": predicted_emotion,
            "confidence": confidence,
            "top_3_predictions": top_3
        }

    finally:
        # Clean up: delete the temporary file whether prediction succeeded or failed
        if os.path.exists(temp_path):
            os.remove(temp_path)