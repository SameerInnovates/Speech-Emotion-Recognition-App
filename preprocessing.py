import librosa
import numpy as np

def extract_features(file_path, config):
    """
    Takes a path to an audio file and the loaded config (containing
    max_len, n_mfcc, mean, std), and returns a properly shaped,
    normalized MFCC array ready for the model.
    """
    max_len = config['max_len']
    n_mfcc = config['n_mfcc']
    mean = np.array(config['mean']).reshape(1, n_mfcc, 1, 1)
    std = np.array(config['std']).reshape(1, n_mfcc, 1, 1)

    # Step 1: Load audio (same as Colab)
    signal, sr = librosa.load(file_path, sr=None)

    # Step 2: Extract MFCCs (same settings as training)
    mfcc = librosa.feature.mfcc(y=signal, sr=sr, n_mfcc=n_mfcc)

    # Step 3: Pad or truncate to exactly max_len frames (same as training)
    if mfcc.shape[1] < max_len:
        pad_width = max_len - mfcc.shape[1]
        mfcc = np.pad(mfcc, pad_width=((0, 0), (0, pad_width)), mode='constant')
    else:
        mfcc = mfcc[:, :max_len]

    # Step 4: Reshape to match model input: (1, n_mfcc, max_len, 1)
    mfcc = mfcc[np.newaxis, ..., np.newaxis]

    # Step 5: Normalize using the SAME mean/std saved from training
    mfcc = (mfcc - mean) / (std + 1e-8)

    return mfcc