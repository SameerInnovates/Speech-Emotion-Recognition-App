import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Trash2, Clock } from 'lucide-react';
import { EMOTION_META } from '../emotions';

function formatTime(iso) {
  const date = new Date(iso);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function History({ history, onDelete, onClear }) {
  const [query, setQuery] = useState('');

  const filtered = history.filter((item) =>
    item.emotion.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <motion.div
      className="history glass"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25 }}
    >
      <div className="history-header">
        <h3>History</h3>
        {history.length > 0 && (
          <button className="history-clear" onClick={onClear}>
            Clear all
          </button>
        )}
      </div>

      <div className="history-search">
        <Search size={14} strokeWidth={2} />
        <input
          type="text"
          placeholder="Search by emotion..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {filtered.length === 0 && (
        <p className="history-empty">
          {history.length === 0 ? 'No predictions yet.' : 'No matches found.'}
        </p>
      )}

      <div className="history-list">
        <AnimatePresence>
          {filtered.map((item) => {
            const meta = EMOTION_META[item.emotion] || { color: '#8b92a8', emoji: '🎧' };
            return (
              <motion.div
                key={item.id}
                className="history-row"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
              >
                <span className="history-emoji">{meta.emoji}</span>
                <div className="history-info">
                  <span className="history-emotion" style={{ color: meta.color }}>
                    {item.emotion}
                  </span>
                  <span className="history-confidence">
                    {(item.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <span className="history-time">
                  <Clock size={12} strokeWidth={2} />
                  {formatTime(item.time)}
                </span>
                <button
                  className="history-delete"
                  onClick={() => onDelete(item.id)}
                  aria-label="Delete entry"
                >
                  <Trash2 size={14} strokeWidth={2} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default History;