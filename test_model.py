import tensorflow as tf
import pickle
import json
import numpy as np

# Load the model
model = tf.keras.models.load_model('models/model.keras')
print("Model loaded successfully!")
model.summary()

# Load the label encoder
with open('models/label_encoder.pkl', 'rb') as f:
    label_encoder = pickle.load(f)
print("\nLabel encoder loaded successfully!")
print("Classes:", label_encoder.classes_)

# Load the config
with open('models/config.json', 'r') as f:
    config = json.load(f)
print("\nConfig loaded successfully!")
print("Config keys:", list(config.keys()))
print("MAX_LEN:", config['max_len'])
print("n_mfcc:", config['n_mfcc'])

# Quick test: run a random dummy input through the model, just to confirm it can predict
dummy_input = np.random.randn(1, config['n_mfcc'], config['max_len'], 1)
prediction = model.predict(dummy_input)
predicted_class = np.argmax(prediction, axis=1)
predicted_emotion = label_encoder.inverse_transform(predicted_class)

print("\nDummy prediction test:")
print("Raw probabilities:", prediction[0])
print("Predicted emotion:", predicted_emotion[0])