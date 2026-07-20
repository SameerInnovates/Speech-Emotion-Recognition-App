# Speech Emotion Recognition

A full-stack deep learning application that predicts human emotion from speech audio. Built as part of the CodeAlpha Machine Learning Internship.

**Live Demo:** https://speech-emotion-recognition-app-ky1m-phi.vercel.app  

## Overview

Upload a short voice recording, and the app predicts the emotion behind it — angry, calm, disgust, fearful, happy, neutral, sad, or surprised — along with a confidence score and the top 3 most likely emotions.

## Tech Stack

| Layer | Technology |
|---|---|
| Model Training | Google Colab, TensorFlow/Keras, Librosa |
| Backend | FastAPI, Python |
| Frontend | React (Vite), Framer Motion |
| Deployment | Render (backend), Vercel (frontend) |

## Model Details

- **Dataset:** RAVDESS (1,440 labeled audio clips, 8 emotions, 24 actors)
- **Features:** 40-coefficient MFCCs, padded/truncated to 130 time frames, per-coefficient normalized
- **Architecture:** CNN — 3× (Conv2D + MaxPooling2D + Dropout), Dense(128), Dropout(0.4)
- **Data augmentation:** noise injection and time-stretching, tripling the effective training set
- **Test accuracy:** ~40% (vs. 12.5% random baseline for 8 classes)

## Project Structure

```
Speech-Emotion-Recognition-App/
├── frontend/              # React (Vite) application
│   └── src/
│       ├── components/    # AudioUploader, PredictionResult, LoadingBars, Hero
│       ├── services/      # API client
│       └── emotions.js    # Emotion color/emoji mapping
├── models/                # Trained model artifacts
│   ├── model.keras
│   ├── label_encoder.pkl
│   └── config.json        # Normalization stats + MFCC settings
├── main.py                # FastAPI backend (/health, /predict)
├── preprocessing.py       # MFCC extraction matching training pipeline
└── requirements.txt
```

## Running Locally

**Backend:**
```bash
python -m venv venv
venv\Scripts\Activate.ps1        # Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Key Engineering Decisions

- **Dense(128) over Dense(64):** systematic debugging (isolating variables across multiple training runs) showed a narrower Dense layer consistently prevented the model from learning at all — root-caused rather than assumed.
- **Per-coefficient MFCC normalization:** raised validation accuracy meaningfully by giving the CNN cleanly-scaled input.
- **Data augmentation (noise + time-stretch):** reduced the training/validation accuracy gap, narrowing overfitting.
- **tensorflow-cpu + Python 3.11 pin for deployment:** Render's free tier has no GPU, and Keras 3's model format required matching the TensorFlow version used during training in Colab.

## Future Improvements

- Larger/more balanced dataset (neutral currently has half the samples of other classes)
- Address the calm/neutral/sad acoustic confusion identified in the confusion matrix
- Persistent prediction history (currently browser-local only)

## License

MIT