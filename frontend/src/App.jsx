import { useState } from 'react';
import Hero from './components/Hero';
import AudioUploader from './components/AudioUploader';
import PredictionResult from './components/PredictionResult';
import LoadingBars from './components/LoadingBars';
import { predictEmotion } from './services/api';
import './App.css';

function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileSelect = async (file) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await predictEmotion(file);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <Hero />
      <AudioUploader onFileSelect={handleFileSelect} />

      {loading && <LoadingBars />}
      {error && <p className="status-text error-text">{error}</p>}

      <PredictionResult result={result} />
    </div>
  );
}

export default App;