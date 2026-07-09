import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, FileAudio } from 'lucide-react';

function AudioUploader({ onFileSelect }) {
  const [fileName, setFileName] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const processFile = (file) => {
    if (!file) return;
    setFileName(file.name);
    onFileSelect(file);
  };

  const handleInputChange = (event) => {
    processFile(event.target.files[0]);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    processFile(event.dataTransfer.files[0]);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <motion.div
      className={`uploader glass ${isDragging ? 'uploader-active' : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => inputRef.current.click()}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <motion.div
        animate={{ y: isDragging ? -4 : 0 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        {fileName ? (
          <FileAudio size={32} color="var(--accent-cyan)" strokeWidth={1.5} />
        ) : (
          <UploadCloud size={32} color="var(--text-muted)" strokeWidth={1.5} />
        )}
      </motion.div>

      <p className="uploader-label">
        {fileName ? fileName : 'Drag and drop audio, or click to browse'}
      </p>

      {!fileName && <span className="uploader-hint">.wav or .mp3</span>}

      <input
        ref={inputRef}
        type="file"
        accept=".wav,.mp3"
        onChange={handleInputChange}
        className="uploader-input-hidden"
      />
    </motion.div>
  );
}

export default AudioUploader;