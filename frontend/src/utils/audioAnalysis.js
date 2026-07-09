function fft(re, im) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len;
    const wRe = Math.cos(ang), wIm = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let curRe = 1, curIm = 0;
      for (let j = 0; j < len / 2; j++) {
        const uRe = re[i + j], uIm = im[i + j];
        const vRe = re[i + j + len / 2] * curRe - im[i + j + len / 2] * curIm;
        const vIm = re[i + j + len / 2] * curIm + im[i + j + len / 2] * curRe;
        re[i + j] = uRe + vRe;
        im[i + j] = uIm + vIm;
        re[i + j + len / 2] = uRe - vRe;
        im[i + j + len / 2] = uIm - vIm;
        const nextRe = curRe * wRe - curIm * wIm;
        const nextIm = curRe * wIm + curIm * wRe;
        curRe = nextRe;
        curIm = nextIm;
      }
    }
  }
}

export async function decodeAudioFile(file) {
  const arrayBuffer = await file.arrayBuffer();
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const ctx = new AudioCtx();
  const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
  const channelData = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;
  ctx.close();
  return { samples: channelData, sampleRate };
}

export function getWaveformPeaks(samples, numBuckets = 100) {
  const bucketSize = Math.floor(samples.length / numBuckets);
  const peaks = [];
  for (let i = 0; i < numBuckets; i++) {
    let min = 0, max = 0;
    const start = i * bucketSize;
    for (let j = start; j < start + bucketSize && j < samples.length; j++) {
      if (samples[j] < min) min = samples[j];
      if (samples[j] > max) max = samples[j];
    }
    peaks.push({ min, max });
  }
  return peaks;
}

function hzToMel(hz) {
  return 2595 * Math.log10(1 + hz / 700);
}

function melToHz(mel) {
  return 700 * (10 ** (mel / 2595) - 1);
}

function buildMelFilterbank(numFilters, frameSize, sampleRate) {
  const numBins = frameSize / 2;
  const minMel = hzToMel(0);
  const maxMel = hzToMel(sampleRate / 2);
  const melPoints = Array.from({ length: numFilters + 2 }, (_, i) =>
    minMel + ((maxMel - minMel) * i) / (numFilters + 1)
  );
  const hzPoints = melPoints.map(melToHz);
  const binPoints = hzPoints.map((hz) => Math.floor(((frameSize + 1) * hz) / sampleRate));

  const filters = [];
  for (let m = 1; m <= numFilters; m++) {
    const filter = new Float32Array(numBins);
    const left = binPoints[m - 1], center = binPoints[m], right = binPoints[m + 1];
    for (let k = left; k < center; k++) {
      if (k >= 0 && k < numBins) filter[k] = (k - left) / Math.max(center - left, 1);
    }
    for (let k = center; k < right; k++) {
      if (k >= 0 && k < numBins) filter[k] = (right - k) / Math.max(right - center, 1);
    }
    filters.push(filter);
  }
  return filters;
}

export function computeSTFT(samples, frameSize = 512, hopSize = 256) {
  const numFrames = Math.max(1, Math.floor((samples.length - frameSize) / hopSize));
  const window = new Float32Array(frameSize);
  for (let i = 0; i < frameSize; i++) {
    window[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (frameSize - 1));
  }

  const frames = [];
  for (let f = 0; f < numFrames; f++) {
    const start = f * hopSize;
    const re = new Float32Array(frameSize);
    const im = new Float32Array(frameSize);
    for (let i = 0; i < frameSize; i++) {
      re[i] = (samples[start + i] || 0) * window[i];
    }
    fft(re, im);
    const magnitude = new Float32Array(frameSize / 2);
    for (let i = 0; i < frameSize / 2; i++) {
      magnitude[i] = Math.sqrt(re[i] * re[i] + im[i] * im[i]);
    }
    frames.push(magnitude);
  }
  return frames;
}

export function computeMelSpectrogram(stftFrames, sampleRate, frameSize = 512, numFilters = 40) {
  const filterbank = buildMelFilterbank(numFilters, frameSize, sampleRate);
  return stftFrames.map((frame) => {
    const melEnergies = new Float32Array(numFilters);
    for (let m = 0; m < numFilters; m++) {
      let sum = 0;
      for (let k = 0; k < frame.length; k++) {
        sum += frame[k] * frame[k] * filterbank[m][k];
      }
      melEnergies[m] = Math.log(sum + 1e-8);
    }
    return melEnergies;
  });
}

export function computeMFCC(melFrames, numCoeffs = 13) {
  const numFilters = melFrames[0]?.length || 0;
  return melFrames.map((melEnergies) => {
    const mfcc = new Float32Array(numCoeffs);
    for (let k = 0; k < numCoeffs; k++) {
      let sum = 0;
      for (let n = 0; n < numFilters; n++) {
        sum += melEnergies[n] * Math.cos((Math.PI / numFilters) * (n + 0.5) * k);
      }
      mfcc[k] = sum;
    }
    return mfcc;
  });
}

export async function analyzeAudioFile(file) {
  const { samples, sampleRate } = await decodeAudioFile(file);
  const waveform = getWaveformPeaks(samples, 120);
  const stftFrames = computeSTFT(samples);
  const melFrames = computeMelSpectrogram(stftFrames, sampleRate);
  const mfccFrames = computeMFCC(melFrames);
  return { waveform, spectrogram: melFrames, mfcc: mfccFrames };
}