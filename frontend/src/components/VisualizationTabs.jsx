import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Activity, BarChart, Grid } from 'lucide-react';
import { analyzeAudioFile } from '../utils/audioAnalysis';

const TABS = [
  { id: 'waveform', label: 'Waveform', icon: Activity },
  { id: 'spectrogram', label: 'Spectrogram', icon: BarChart },
  { id: 'mfcc', label: 'MFCC', icon: Grid },
];

function drawWaveform(canvas, peaks) {
  const ctx = canvas.getContext('2d');
  const { width, height } = canvas;
  ctx.clearRect(0, 0, width, height);
  const barWidth = width / peaks.length;
  const mid = height / 2;

  peaks.forEach((peak, i) => {
    const x = i * barWidth;
    const topY = mid + peak.max * mid * 0.9;
    const botY = mid + peak.min * mid * 0.9;
    ctx.fillStyle = '#6ee7d9';
    ctx.fillRect(x, Math.min(topY, botY), Math.max(barWidth - 1, 1), Math.abs(topY - botY) || 1);
  });
}

function drawHeatmap(canvas, frames, colorHex) {
  const ctx = canvas.getContext('2d');
  const { width, height } = canvas;
  ctx.clearRect(0, 0, width, height);
  if (!frames.length) return;

  const numBins = frames[0].length;
  let min = Infinity, max = -Infinity;
  frames.forEach((frame) => {
    frame.forEach((v) => {
      if (v < min) min = v;
      if (v > max) max = v;
    });
  });
  const range = max - min || 1;

  const cellW = width / frames.length;
  const cellH = height / numBins;

  const r = parseInt(colorHex.slice(1, 3), 16);
  const g = parseInt(colorHex.slice(3, 5), 16);
  const b = parseInt(colorHex.slice(5, 7), 16);

  frames.forEach((frame, x) => {
    for (let y = 0; y < numBins; y++) {
      const norm = (frame[y] - min) / range;
      const alpha = Math.max(norm, 0.04);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
      ctx.fillRect(x * cellW, height - (y + 1) * cellH, cellW + 0.5, cellH + 0.5);
    }
  });
}

function VisualizationTabs({ file }) {
  const [activeTab, setActiveTab] = useState('waveform');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!file) return;
    setLoading(true);
    setData(null);
    analyzeAudioFile(file)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [file]);

  useEffect(() => {
    if (!data || !canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = canvas.clientWidth * 2;
    canvas.height = canvas.clientHeight * 2;

    if (activeTab === 'waveform') drawWaveform(canvas, data.waveform);
    if (activeTab === 'spectrogram') drawHeatmap(canvas, data.spectrogram, '#9b7ede');
    if (activeTab === 'mfcc') drawHeatmap(canvas, data.mfcc, '#6ee7d9');
  }, [data, activeTab]);

  if (!file) return null;

  return (
    <motion.div
      className="viz glass"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
    >
      <div className="viz-tabs">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`viz-tab ${activeTab === tab.id ? 'viz-tab-active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={14} strokeWidth={2} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="viz-canvas-wrap">
        {loading && <p className="viz-loading">Analyzing audio...</p>}
        <canvas ref={canvasRef} className="viz-canvas" />
      </div>
    </motion.div>
  );
}

export default VisualizationTabs;