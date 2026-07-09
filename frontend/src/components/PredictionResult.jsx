import { motion } from 'framer-motion';
import { EMOTION_META } from '../emotions';

function ConfidenceRing({ percentage, color }) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="confidence-ring">
      <svg viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={radius} className="ring-bg" />
        <motion.circle
          cx="40"
          cy="40"
          r={radius}
          stroke={color}
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
          transform="rotate(-90 40 40)"
        />
      </svg>
      <div className="ring-label">
        <span className="ring-pct">{percentage.toFixed(0)}%</span>
        <span className="ring-caption">confidence</span>
      </div>
    </div>
  );
}

function PredictionResult({ result }) {
  if (!result) return null;

  const { predicted_emotion, confidence, top_3_predictions } = result;
  const meta = EMOTION_META[predicted_emotion] || { color: '#8b92a8', emoji: '🎧' };
  const confidencePct = confidence * 100;

  return (
    <motion.div
      className="result glass"
      initial={{ opacity: 0, scale: 0.96, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      <div className="result-header">
        <ConfidenceRing percentage={confidencePct} color={meta.color} />
        <div>
          <span className="result-emoji">{meta.emoji}</span>
          <h2 className="result-emotion" style={{ color: meta.color }}>
            {predicted_emotion}
          </h2>
        </div>
      </div>

      <div className="top-predictions">
        <h3>Top Predictions</h3>
        <div className="pred-list">
          {top_3_predictions.map((pred, index) => {
            const predMeta = EMOTION_META[pred.emotion] || { color: '#8b92a8' };
            const pct = pred.confidence * 100;
            return (
              <div className="pred-row" key={index}>
                <span className="pred-name">{pred.emotion}</span>
                <div className="pred-track">
                  <motion.div
                    className="pred-fill"
                    style={{ backgroundColor: predMeta.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.7, delay: 0.1 + index * 0.1, ease: 'easeOut' }}
                  />
                </div>
                <span className="pred-pct">{pct.toFixed(0)}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

export default PredictionResult;